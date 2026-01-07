const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const express = require("express");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// API Router 생성 - 모든 API 엔드포인트를 이 라우터에 등록
const apiRouter = express.Router();

const SECRET_KEY = "your-secret-key"; // 중요: 실제 프로젝트에서는 이 키를 안전하게 관리해야 합니다.
const ACCESS_TOKEN_EXPIRES_IN = "1h"; // Access Token 만료 시간
const REFRESH_TOKEN_EXPIRES_IN = "1d"; // Refresh Token 만료 시간

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Open Market API",
      version: "1.0.0",
      description: "Open Market 오픈마켓 프로젝트 API 문서입니다.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api"
            : "https://open-market-jade.vercel.app/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT 토큰을 입력하세요 (Bearer 접두사 제외)",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "상품 ID",
            },
            name: {
              type: "string",
              description: "상품명",
            },
            info: {
              type: "string",
              description: "상품 설명",
            },
            image: {
              type: "string",
              format: "url",
              description: "상품 이미지 URL",
            },
            price: {
              type: "integer",
              description: "상품 가격",
            },
            shipping_method: {
              type: "string",
              enum: ["PARCEL", "DELIVERY"],
              description: "배송 방법",
            },
            shipping_fee: {
              type: "integer",
              description: "배송비",
            },
            stock: {
              type: "integer",
              description: "재고 수량",
            },
            seller: {
              type: "object",
              description: "판매자 정보",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "생성 일시",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "수정 일시",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Accounts",
        description: "계정 관리 API (회원가입, 로그인, 토큰 관리)",
      },
      {
        name: "Products",
        description: "상품 관리 API",
      },
      {
        name: "Cart",
        description: "장바구니 관리 API",
      },
      {
        name: "Order",
        description: "주문 관리 API",
      },
    ],
  },
  apis: [path.join(__dirname, "server.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// JWT 토큰 생성을 위한 함수
function createToken(payload, expiresIn) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// 인증 미들웨어
function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token is required and must be Bearer type.",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // 요청 객체에 사용자 정보 추가
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

server.use(middlewares);
server.use(jsonServer.bodyParser); // POST 요청의 body를 파싱하기 위해 필수

// Swagger UI 설정
server.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Open Market API Documentation",
  })
);

// Swagger JSON 엔드포인트
server.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /accounts/buyer/signup:
 *   post:
 *     summary: 구매자 회원가입
 *     description: 새로운 구매자 계정을 생성합니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *               - phone_number
 *             properties:
 *               username:
 *                 type: string
 *                 description: "사용자 아이디 (이메일 형식)"
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *       '400':
 *         description: 필수 필드 누락 또는 아이디 중복
 */
apiRouter.post("/accounts/buyer/signup", (req, res) => {
  const db = router.db;
  const { password, username } = req.body;

  if (!password || !username) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const existingUser = db.get("users").find({ username }).value();
  if (existingUser) {
    return res.status(400).json({ error: "This username is already taken." });
  }

  db.get("users")
    .push({ ...req.body, user_type: "BUYER" })
    .write();
  res.status(201).json(req.body);
});

/**
 * @swagger
 * /accounts/seller/signup:
 *   post:
 *     summary: 판매자 회원가입
 *     description: 새로운 판매자 계정을 생성합니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *               - phone_number
 *               - company_registration_number
 *               - store_name
 *             properties:
 *               username:
 *                 type: string
 *                 description: "사용자 아이디 (이메일 형식)"
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               company_registration_number:
 *                 type: string
 *               store_name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *       '400':
 *         description: 필수 필드 누락 또는 아이디 중복
 */
apiRouter.post("/accounts/seller/signup", (req, res) => {
  const db = router.db;
  const { password, username } = req.body;

  if (!password || !username) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const existingUser = db.get("users").find({ username }).value();
  if (existingUser) {
    return res.status(400).json({ error: "This username is already taken." });
  }

  db.get("users")
    .push({ ...req.body, user_type: "SELLER" })
    .write();
  res.status(201).json(req.body);
});

/**
 * @swagger
 * /accounts/validate-username:
 *   post:
 *     summary: 아이디 중복 검증
 *     description: 사용자 아이디(username)가 이미 사용 중인지 확인합니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: 'test@example.com'
 *             required:
 *               - username
 *     responses:
 *       '200':
 *         description: 사용 가능한 아이디일 경우
 *       '400':
 *         description: 아이디가 이미 존재할 경우
 */
apiRouter.post("/accounts/validate-username", (req, res) => {
  const db = router.db;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username 필드를 추가해주세요." });
  }

  const existingUser = db.get("users").find({ username }).value();
  if (existingUser) {
    return res.status(400).json({ error: "이미 사용 중인 아이디입니다." });
  }

  res.status(200).json({ message: "사용 가능한 아이디입니다." });
});

/**
 * @swagger
 * /accounts/seller/validate-registration-number:
 *   post:
 *     summary: 사업자등록번호 유효성 및 중복 검증
 *     description: 판매자의 사업자등록번호가 10자리 숫자인지, 그리고 이미 등록된 번호인지 검증합니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_registration_number:
 *                 type: string
 *                 description: 검증할 10자리 사업자등록번호.
 *                 example: '1234567890'
 *             required:
 *               - company_registration_number
 *     responses:
 *       '200':
 *         description: 사용 가능한 사업자등록번호일 경우
 *       '400':
 *         description: 잘못된 요청 또는 이미 등록된 번호일 경우
 */
apiRouter.post("/accounts/seller/validate-registration-number", (req, res) => {
  const db = router.db;
  const { company_registration_number } = req.body;

  if (!company_registration_number) {
    return res
      .status(400)
      .json({ error: "company_registration_number 필드를 추가해주세요." });
  }

  const isValidFormat = /^\d{10}$/.test(company_registration_number);
  if (!isValidFormat) {
    return res
      .status(400)
      .json({ error: "사업자등록번호는 10자리 숫자로 입력해야 합니다." });
  }

  const existingUser = db
    .get("users")
    .find({ company_registration_number: company_registration_number })
    .value();

  if (existingUser) {
    return res.status(400).json({ error: "이미 등록된 사업자등록번호입니다." });
  }

  res.status(200).json({ message: "사용 가능한 사업자등록번호입니다." });
});

/**
 * @swagger
 * /accounts/signin:
 *   post:
 *     summary: 사용자 로그인
 *     description: 아이디와 비밀번호로 로그인하고 Access/Refresh 토큰 및 사용자 정보를 발급받습니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: "사용자 아이디"
 *                 example: "buyer1"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "1234"
 *     responses:
 *       '200':
 *         description: 로그인 성공. 토큰 및 사용자 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: string
 *                   description: "Access Token"
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refresh:
 *                   type: string
 *                   description: "Refresh Token"
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "buyer1"
 *                     name:
 *                       type: string
 *                       example: "홍길동"
 *                     phone_number:
 *                       type: string
 *                       example: "010-1234-5678"
 *                     user_type:
 *                       type: string
 *                       example: "BUYER"
 *       '400':
 *         description: 아이디 또는 비밀번호 불일치
 */
apiRouter.post("/accounts/signin", (req, res) => {
  const { username, password } = req.body;

  const db = router.db;
  const user = db.get("users").find({ username }).value();

  if (!user || user.password !== password) {
    return res
      .status(400)
      .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  // 3. 로그인 성공: Access/Refresh 토큰 발급
  const userPayload = { userId: user.username, name: user.name };
  const accessToken = createToken(userPayload, ACCESS_TOKEN_EXPIRES_IN);
  const refreshToken = createToken(userPayload, REFRESH_TOKEN_EXPIRES_IN);

  res.status(200).json({
    access: accessToken,
    refresh: refreshToken,
    user: {
      username: user.username,
      name: user.name,
      phone_number: user.phone_number,
      user_type: user.user_type,
    },
  });
});

/**
 * @swagger
 * /accounts/token/refresh:
 *   post:
 *     summary: Access Token 갱신
 *     description: 유효한 Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh
 *             properties:
 *               refresh:
 *                 type: string
 *                 description: "로그인 시 발급받은 Refresh Token"
 *     responses:
 *       '200':
 *         description: Access Token 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: string
 *       '400':
 *         description: Refresh Token이 요청에 포함되지 않음
 *       '401':
 *         description: Refresh Token이 유효하지 않거나 만료됨
 */
apiRouter.post("/accounts/token/refresh", (req, res) => {
  const { refresh } = req.body;

  if (!refresh) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refresh, SECRET_KEY);
    const userPayload = { userId: decoded.userId, name: decoded.name };
    const accessToken = createToken(userPayload, ACCESS_TOKEN_EXPIRES_IN);

    res.status(200).json({ access: accessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: 상품 목록 조회
 *     description: 페이지네이션과 검색을 적용하여 상품 목록을 조회합니다.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 한 페이지에 보여줄 상품 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색할 상품 이름 키워드
 *     responses:
 *       '200':
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: 전체 상품 개수
 *                 next:
 *                   type: string
 *                   nullable: true
 *                   description: 다음 페이지 URL
 *                 previous:
 *                   type: string
 *                   nullable: true
 *                   description: 이전 페이지 URL
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 */
apiRouter.get("/products", (req, res) => {
  let allProducts = router.db.get("products").value();
  const search = req.query.search;

  // 검색어가 있으면 상품 이름으로 필터링
  if (search) {
    const lowerSearch = search.toLowerCase();
    allProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.info.toLowerCase().includes(lowerSearch)
    );
  }

  const count = allProducts.length;
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.page_size || "10", 10);

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const results = allProducts.slice(startIndex, endIndex);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

  let nextUrl = null;
  if (endIndex < count) {
    nextUrl = `${baseUrl}?page=${page + 1}&page_size=${pageSize}${searchParam}`;
  }

  let previousUrl = null;
  if (startIndex > 0) {
    previousUrl = `${baseUrl}?page=${
      page - 1
    }&page_size=${pageSize}${searchParam}`;
  }

  res.json({
    count: count,
    next: nextUrl,
    previous: previousUrl,
    results: results,
  });
});

/**
 * @swagger
 * /{seller_name}/products:
 *   get:
 *     summary: 특정 판매자의 상품 목록 조회
 *     description: 특정 판매자의 상품 목록을 페이지네이션을 적용하여 조회합니다.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: seller_name
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품을 조회할 판매자의 이름
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 한 페이지에 보여줄 상품 수
 *     responses:
 *       '200':
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProducts'
 */
apiRouter.get("/:seller_name/products", (req, res) => {
  const { seller_name } = req.params;

  const allProducts = router.db.get("products").value();
  const sellerProducts = allProducts.filter(
    (p) => p.seller && p.seller.username === seller_name
  );

  const count = sellerProducts.length;
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.page_size || "10", 10);

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const results = sellerProducts.slice(startIndex, endIndex);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;

  let nextUrl = null;
  if (endIndex < count) {
    nextUrl = `${baseUrl}?page=${page + 1}&page_size=${pageSize}`;
  }

  let previousUrl = null;
  if (startIndex > 0) {
    previousUrl = `${baseUrl}?page=${page - 1}&page_size=${pageSize}`;
  }

  res.json({
    count: count,
    next: nextUrl,
    previous: previousUrl,
    results: results,
  });
});

/**
 * @swagger
 * /products/{product_id}:
 *   get:
 *     summary: 특정 상품 상세 정보 조회
 *     description: product_id에 해당하는 상품의 상세 정보를 조회합니다.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 상품의 ID
 *     responses:
 *       '200':
 *         description: 상품 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 info:
 *                   type: string
 *                 image:
 *                   type: string
 *                   format: url
 *                 price:
 *                   type: integer
 *                 shipping_method:
 *                   type: string
 *                   enum: [PARCEL, DELIVERY]
 *                 shipping_fee:
 *                   type: integer
 *                 stock:
 *                   type: integer
 *                 seller:
 *                   type: object
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: 해당 ID의 상품을 찾을 수 없음
 */
apiRouter.get("/products/:product_id", (req, res) => {
  const productId = parseInt(req.params.product_id, 10);
  const product = router.db.get("products").find({ id: productId }).value();

  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ error: "No Product matches the given query." });
  }
});

/**
 * @swagger
 * /products/{product_id}:
 *   put:
 *     summary: 상품 정보 수정
 *     description: 특정 상품의 정보를 부분적으로 수정합니다. `id`, `seller`, `created_at` 필드는 수정할 수 없습니다.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 상품의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 수정할 필드와 값만 포함합니다.
 *             example:
 *               name: "새로운 상품 이름"
 *               price: 15000
 *     responses:
 *       '200':
 *         description: 상품 정보 수정 성공. 수정된 전체 상품 정보를 반환합니다.
 *       '404':
 *         description: 해당 ID의 상품을 찾을 수 없음
 */
apiRouter.put("/products/:product_id", (req, res) => {
  const productId = parseInt(req.params.product_id, 10);
  const product = router.db.get("products").find({ id: productId }).value();

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // 수정 불가능한 필드 제거
  delete req.body.id;
  delete req.body.seller;
  delete req.body.created_at;
  delete req.body.updated_at;

  const newUpdatedAt = new Date().toISOString();

  const updatedProduct = router.db
    .get("products")
    .find({ id: productId })
    .assign({ ...req.body, updated_at: newUpdatedAt })
    .write();

  res.status(200).json(updatedProduct);
});

/**
 * @swagger
 * /products/{product_id}:
 *   delete:
 *     summary: 상품 삭제
 *     description: 특정 상품을 삭제합니다. 상품의 소유자만 삭제할 수 있습니다.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 상품의 ID
 *     responses:
 *       '200':
 *         description: 상품 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "상품이 삭제되었습니다."
 *       '401':
 *         description: 인증 토큰이 없거나 유효하지 않음
 *       '403':
 *         description: 해당 상품을 삭제할 권한이 없음
 *       '404':
 *         description: 해당 ID의 상품을 찾을 수 없음
 */
apiRouter.delete("/products/:product_id", checkAuth, (req, res) => {
  const productId = parseInt(req.params.product_id, 10);
  const product = router.db.get("products").find({ id: productId }).value();

  if (!product) {
    return res.status(404).json({ detail: "찾을 수 없습니다." });
  }

  // 인증된 사용자가 상품의 판매자인지 확인
  if (product.seller.username !== req.user.userId) {
    return res
      .status(403)
      .json({ detail: "이 작업을 수행할 권한(permission)이 없습니다." });
  }

  router.db.get("products").remove({ id: productId }).write();

  res.status(200).json({ detail: "상품이 삭제되었습니다." });
});

/**
 * @swagger
 * /cart/:
 *   get:
 *     summary: 장바구니 목록 조회
 *     description: 사용자의 장바구니에 담긴 상품 목록을 조회합니다.
 *     tags: [Cart]
 *     responses:
 *       '200':
 *         description: 장바구니 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: 장바구니에 담긴 상품 종류의 수
 *                 next:
 *                   type: string
 *                   nullable: true
 *                   description: 다음 페이지 URL
 *                 previous:
 *                   type: string
 *                   nullable: true
 *                   description: 이전 페이지 URL
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       product:
 *                         type: object
 *                         description: "상품 정보"
 *                       quantity:
 *                         type: integer
 *                       added_at:
 *                         type: string
 *                         format: date-time
 *             examples:
 *               has_items:
 *                 value:
 *                   count: 1
 *                   next: null
 *                   previous: null
 *                   results:
 *                     - id: 1
 *                       product:
 *                         id: 1
 *                         name: "상품 1"
 *                         price: 10000
 *                       quantity: 2
 *                       added_at: "2025-11-11T12:00:00Z"
 *               no_items:
 *                 value:
 *                   count: 0
 *                   next: null
 *                   previous: null
 *                   results: []
 *
 */
apiRouter.get("/cart/", (req, res) => {
  const allCartItems = router.db.get("cart").value();

  const count = allCartItems.length;
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.page_size || "10", 10);

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const results = allCartItems.slice(startIndex, endIndex);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;

  let nextUrl = null;
  if (endIndex < count) {
    nextUrl = `${baseUrl}?page=${page + 1}&page_size=${pageSize}`;
  }

  let previousUrl = null;
  if (startIndex > 0) {
    previousUrl = `${baseUrl}?page=${page - 1}&page_size=${pageSize}`;
  }

  res.json({
    count: count,
    next: nextUrl,
    previous: previousUrl,
    results: results,
  });
});

/**
 * @swagger
 * /cart/:
 *   post:
 *     summary: 장바구니에 상품 추가
 *     description: 장바구니에 새로운 상품을 추가합니다. 인증이 필요합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: "추가할 상품의 ID"
 *               quantity:
 *                 type: integer
 *                 description: "추가할 상품의 수량"
 *     responses:
 *       '201':
 *         description: 상품 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "장바구니에 상품이 담겼습니다."
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 해당 ID의 상품을 찾을 수 없음
 */
apiRouter.post("/cart/", checkAuth, (req, res) => {
  const { product_id, quantity } = req.body;
  const db = router.db;
  const username = req.user.userId; // from checkAuth middleware

  const product = db.get("products").find({ id: product_id }).value();

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  const cart = db.get("cart");
  const lastItem = cart.value().slice(-1)[0];
  const newId = lastItem ? lastItem.id + 1 : 1;

  const newCartItem = {
    id: newId,
    username: username,
    product: product,
    quantity: quantity,
    added_at: new Date().toISOString(),
  };

  cart.push(newCartItem).write();

  res.status(201).json({ detail: "장바구니에 상품이 담겼습니다." });
});

/**
 * @swagger
 * /cart/{cart_item_id}:
 *   get:
 *     summary: 특정 장바구니 상품 조회
 *     description: 특정 ID를 가진 장바구니 상품의 상세 정보를 조회합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 장바구니 상품의 ID
 *     responses:
 *       '200':
 *         description: 장바구니 상품 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 product:
 *                   type: object
 *                   description: "상품 정보"
 *                 quantity:
 *                   type: integer
 *                 added_at:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: 자격 인증데이터(authentication credentials)가 제공되지 않았습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "자격 인증데이터(authentication credentials)가 제공되지 않았습니다."
 *       '403':
 *         description: 접근권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "접근권한이 없습니다."
 *       '404':
 *         description: 해당 ID의 장바구니 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "No CartItem matches the given query."
 */
apiRouter.get("/cart/:cart_item_id", checkAuth, (req, res) => {
  const cartItemId = parseInt(req.params.cart_item_id, 10);
  const db = router.db;

  const cartItem = db.get("cart").find({ id: cartItemId }).value();

  if (!cartItem) {
    return res.status(404).json({ detail: "찾을 수 없습니다." });
  }

  // Assuming req.user.userId is available from checkAuth middleware
  // and cartItem has a 'username' field to identify the owner.
  if (cartItem.username !== req.user.userId) {
    return res.status(403).json({ detail: "접근권한이 없습니다." });
  }

  res.status(200).json(cartItem);
});

/**
 * @swagger
 * /cart/{cart_item_id}/:
 *   put:
 *     summary: 장바구니 상품 수량 수정
 *     description: 특정 장바구니 상품의 수량을 수정합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 장바구니 상품의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: "변경할 상품의 수량"
 *     responses:
 *       '200':
 *         description: 수량 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 product:
 *                   type: object
 *                 quantity:
 *                   type: integer
 *                 added_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 접근 권한 없음
 *       '404':
 *         description: 장바구니 상품을 찾을 수 없음
 */
apiRouter.put("/cart/:cart_item_id/", checkAuth, (req, res) => {
  const cartItemId = parseInt(req.params.cart_item_id, 10);
  const { quantity } = req.body;
  const db = router.db;

  const cartItem = db.get("cart").find({ id: cartItemId });

  if (!cartItem.value()) {
    return res.status(404).json({ detail: "찾을 수 없습니다." });
  }

  if (cartItem.value().username !== req.user.userId) {
    return res.status(403).json({ detail: "접근권한이 없습니다." });
  }

  const updatedCartItem = cartItem
    .assign({ quantity: quantity, updated_at: new Date().toISOString() })
    .write();

  res.status(200).json(updatedCartItem);
});

/**
 * @swagger
 * /cart/{cart_item_id}/:
 *   delete:
 *     summary: 장바구니 상품 삭제
 *     description: 특정 ID를 가진 장바구니 상품을 삭제합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_item_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 장바구니 상품의 ID
 *     responses:
 *       '200':
 *         description: 장바구니 상품 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "장바구니에 담긴 상품이 삭제되었습니다."
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 접근 권한 없음
 *       '404':
 *         description: 장바구니 상품을 찾을 수 없음
 */
apiRouter.delete("/cart/:cart_item_id/", checkAuth, (req, res) => {
  const cartItemId = parseInt(req.params.cart_item_id, 10);
  const db = router.db;

  const cartItem = db.get("cart").find({ id: cartItemId });

  if (!cartItem.value()) {
    return res.status(404).json({ detail: "찾을 수 없습니다." });
  }

  if (cartItem.value().username !== req.user.userId) {
    return res.status(403).json({ detail: "접근권한이 없습니다." });
  }

  cartItem.remove().write();

  res.status(200).json({ detail: "장바구니에 담긴 상품이 삭제되었습니다." });
});

/**
 * @swagger
 * /cart/:
 *   delete:
 *     summary: 장바구니 전체 상품 삭제
 *     description: 사용자의 장바구니에 있는 모든 상품을 삭제합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 장바구니 비우기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "장바구니에 담긴 3개의 상품이 삭제되었습니다."
 *       '401':
 *         description: 인증되지 않은 사용자
 */
apiRouter.delete("/cart/", checkAuth, (req, res) => {
  const db = router.db;
  const username = req.user.userId;

  const userCartItems = db.get("cart").filter({ username: username }).value();
  const deleteCount = userCartItems.length;

  if (deleteCount > 0) {
    db.get("cart").remove({ username: username }).write();
  }

  res.status(200).json({
    detail: `장바구니에 담긴 ${deleteCount}개의 상품이 삭제되었습니다.`,
  });
});

/**
 * @swagger
 * /order/:
 *   post:
 *     summary: 상품 주문하기 (바로구매 또는 장바구니 주문)
 *     description: |
 *       `order_type` 필드에 따라 단일 상품을 바로 주문하거나 장바구니의 상품들을 주문합니다.
 *
 *       ### 바로구매 (direct_order)
 *       - `order_type`: "direct_order"
 *       - `product_id`, `quantity` 필드가 필요합니다.
 *
 *       ### 장바구니 주문 (cart_order)
 *       - `order_type`: "cart_order"
 *       - `cart_items` (장바구니 아이템 ID 목록) 필드가 필요합니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_type:
 *                 type: string
 *                 enum: [direct_order, cart_order]
 *               product_id:
 *                 type: integer
 *                 description: "(direct_order 시 필수) 주문할 상품의 ID"
 *               quantity:
 *                 type: integer
 *                 description: "(direct_order 시 필수) 주문할 상품의 수량"
 *               cart_items:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: "(cart_order 시 필수) 주문할 장바구니 아이템들의 ID 목록"
 *               total_price:
 *                 type: integer
 *               receiver:
 *                 type: string
 *               receiver_phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *               address_message:
 *                 type: string
 *                 nullable: true
 *               payment_method:
 *                 type: string
 *                 enum: [card, deposit, phone, naverpay, kakaopay]
 *     responses:
 *       '201':
 *         description: 주문 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 order_number:
 *                   type: string
 *                 payment_method:
 *                   type: string
 *                 order_status:
 *                   type: string
 *                 order_type:
 *                   type: string
 *                 total_price:
 *                   type: integer
 *                 order_items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                       ordered_quantity:
 *                         type: integer
 *                       ordered_unit_price:
 *                         type: integer
 *                       ordered_shipping_fee:
 *                         type: integer
 *                       item_total_price:
 *                         type: integer
 *                 receiver:
 *                   type: string
 *                 receiver_phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 delivery_message:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: 잘못된 요청 (필수 필드 누락, 잘못된 값 등)
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 주문할 상품 또는 장바구니 상품을 찾을 수 없음
 */
apiRouter.post("/order/", checkAuth, (req, res) => {
  const { order_type } = req.body;

  if (order_type === "direct_order") {
    // --- Direct Order Logic ---
    handleDirectOrder(req, res);
  } else if (order_type === "cart_order") {
    // --- Cart Order Logic ---
    handleCartOrder(req, res);
  } else {
    return res.status(400).json({
      order_type: ["'direct_order' 또는 'cart_order'여야 합니다."],
    });
  }
});

function handleDirectOrder(req, res) {
  const db = router.db;
  const username = req.user.userId;
  const {
    product_id,
    quantity,
    total_price,
    receiver,
    receiver_phone_number,
    address,
    address_message,
    payment_method,
  } = req.body;

  // Validation
  const errors = {};
  const requiredFields = {
    product_id,
    quantity,
    total_price,
    receiver,
    receiver_phone_number,
    // address,
    payment_method,
  };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      errors[field] = ["이 필드는 필수 항목입니다."];
    }
  }
  const validPaymentMethods = [
    "card",
    "deposit",
    "phone",
    "naverpay",
    "kakaopay",
  ];
  if (payment_method && !validPaymentMethods.includes(payment_method)) {
    errors.payment_method = [
      `"${payment_method}"이 유효하지 않은 선택(choice)입니다.`,
    ];
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  // Price & Stock Validation
  const product = db.get("products").find({ id: product_id }).value();
  if (!product) {
    return res.status(404).json({
      detail: `유효하지 않은 pk "${product_id}" - 객체가 존재하지 않습니다.`,
    });
  }
  if (product.stock < quantity) {
    return res.status(400).json({
      non_field_errors: [
        `${product.name}(${product.id})의 재고가 부족하여 주문할 수 없습니다.`,
      ],
    });
  }
  // const calculatedPrice = product.price * quantity + product.shipping_fee;
  const calculatedPrice = product.price * quantity;
  if (calculatedPrice !== total_price) {
    return res.status(400).json({
      non_field_errors: `total_price가 맞지 않습니다. 계산 금액은 ${calculatedPrice}원입니다.(배송비 포함)`,
    });
  }

  // Order Creation
  const now = new Date();
  const orders = db.get("orders");
  const lastOrder = orders.value().slice(-1)[0];
  const newId = lastOrder ? lastOrder.id + 1 : 1;

  const newOrder = {
    id: newId,
    username: username,
    order_number: `${now.getTime()}-${String(newId).padStart(6, "0")}`,
    payment_method,
    order_status: "payment_complete",
    order_type: "direct_order",
    total_price,
    order_items: [
      {
        product: product,
        ordered_quantity: quantity,
        ordered_unit_price: product.price,
        ordered_shipping_fee: product.shipping_fee,
        item_total_price: calculatedPrice,
      },
    ],
    receiver,
    receiver_phone_number,
    address,
    delivery_message: address_message,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Update stock
  db.get("products")
    .find({ id: product_id })
    .assign({ stock: product.stock - quantity })
    .write();

  orders.push(newOrder).write();

  const responseOrder = { ...newOrder };
  delete responseOrder.username;
  res.status(201).json(responseOrder);
}

function handleCartOrder(req, res) {
  const db = router.db;
  const username = req.user.userId;
  const {
    cart_items,
    total_price,
    receiver,
    receiver_phone_number,
    address,
    address_message,
    payment_method,
  } = req.body;

  // Validation
  const errors = {};
  const requiredFields = {
    cart_items,
    total_price,
    receiver,
    receiver_phone_number,
    // address,
    payment_method,
  };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      errors[field] = ["이 필드는 필수 항목입니다."];
    }
  }
  if (cart_items && (!Array.isArray(cart_items) || cart_items.length === 0)) {
    errors.cart_items = ["하나 이상의 장바구니 상품을 선택해야 합니다."];
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  // Fetch and Validate Cart Items
  const fetchedCartItems = [];
  const invalidCartItems = [];

  for (const cartItem of cart_items) {
    const item = db
      .get("cart")
      .find(
        (item) =>
          item.product.id === cartItem.product_id && item.username === username
      )
      .value();

    if (!item) {
      invalidCartItems.push(cartItem.product_id);
    } else {
      fetchedCartItems.push(item);
    }
  }

  if (invalidCartItems.length > 0) {
    return res.status(400).json({
      non_field_errors: [
        `다음 카트 아이템이 유효하지 않습니다: ${invalidCartItems.join(", ")}`,
      ],
    });
  }

  // Price & Stock Validation
  let calculatedPrice = 0;
  for (const item of fetchedCartItems) {
    const product = db.get("products").find({ id: item.product.id }).value();
    if (!product) {
      return res.status(400).json({
        detail: `유효하지 않은 pk "${item.product.id}" - 객체가 존재하지 않습니다.`,
      });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        non_field_errors: [
          `${product.name}(${product.id})의 재고가 부족하여 주문할 수 없습니다.`,
        ],
      });
    }
    // calculatedPrice += product.price * item.quantity + product.shipping_fee;
    calculatedPrice += product.price * item.quantity;
  }

  if (calculatedPrice !== total_price) {
    return res.status(400).json({
      non_field_errors: `total_price가 맞지 않습니다. 계산 금액은 ${calculatedPrice}원입니다.(배송비 포함)`,
    });
  }

  // Order Creation
  const now = new Date();
  const orders = db.get("orders");
  const lastOrder = orders.value().slice(-1)[0];
  const newId = lastOrder ? lastOrder.id + 1 : 1;

  const orderItems = fetchedCartItems.map((item) => {
    // Decrement stock
    const product = db.get("products").find({ id: item.product.id });
    product.assign({ stock: product.value().stock - item.quantity }).write();

    return {
      product: item.product,
      ordered_quantity: item.quantity,
      ordered_unit_price: item.product.price,
      ordered_shipping_fee: item.product.shipping_fee,
      item_total_price:
        item.product.price * item.quantity + item.product.shipping_fee,
    };
  });

  const newOrder = {
    id: newId,
    username: username,
    order_number: `${now.getTime()}-${String(newId).padStart(6, "0")}`,
    payment_method,
    order_status: "payment_pending",
    order_type: "cart_order",
    total_price,
    order_items: orderItems,
    receiver,
    receiver_phone_number,
    address,
    delivery_message: address_message,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  orders.push(newOrder).write();

  // Clear ordered items from cart
  // 한 번에 모든 해당 장바구니 아이템을 삭제 (성능 및 가독성 개선)
  const orderedProductIds = cart_items.map((item) => item.product_id);
  db.get("cart")
    .remove(
      (item) =>
        item.username === username &&
        orderedProductIds.includes(item.product.id)
    )
    .write();

  const responseOrder = { ...newOrder };
  delete responseOrder.username;
  res.status(201).json(responseOrder);
}

/**
 * @swagger
 * /order/:
 *   get:
 *     summary: 사용자 주문 목록 조회
 *     description: 인증된 사용자의 주문 목록을 페이지네이션과 함께 조회합니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 한 페이지에 보여줄 주문 수
 *     responses:
 *       '200':
 *         description: 주문 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: 전체 주문 개수
 *                 next:
 *                   type: string
 *                   nullable: true
 *                   description: 다음 페이지 URL
 *                 previous:
 *                   type: string
 *                   nullable: true
 *                   description: 이전 페이지 URL
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       order_number:
 *                         type: string
 *                       payment_method:
 *                         type: string
 *                         enum: [card, deposit, phone, naverpay, kakaopay]
 *                       order_status:
 *                         type: string
 *                         enum: [payment_pending, payment_complete, preparing, shipping, delivered, cancled]
 *                       order_type:
 *                         type: string
 *                         enum: [direct_order, cart_order]
 *                       total_price:
 *                         type: integer
 *                       order_items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: object
 *                             ordered_quantity:
 *                               type: integer
 *                             ordered_unit_price:
 *                               type: integer
 *                             ordered_shipping_fee:
 *                               type: integer
 *                             item_total_price:
 *                               type: integer
 *                       receiver:
 *                         type: string
 *                       receiver_phone_number:
 *                         type: string
 *                       address:
 *                         type: string
 *                       delivery_message:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: 인증되지 않은 사용자
 */
apiRouter.get("/order/", checkAuth, (req, res) => {
  const db = router.db;
  const username = req.user.userId;

  const allUserOrders = db.get("orders").filter({ username: username }).value();

  const count = allUserOrders.length;
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.page_size || "10", 10);

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  const results = allUserOrders.slice(startIndex, endIndex);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;

  let nextUrl = null;
  if (endIndex < count) {
    nextUrl = `${baseUrl}?page=${page + 1}&page_size=${pageSize}`;
  }

  let previousUrl = null;
  if (startIndex > 0) {
    previousUrl = `${baseUrl}?page=${page - 1}&page_size=${pageSize}`;
  }

  // Remove username from each order object in results before sending
  const sanitizedResults = results.map((order) => {
    const { username, ...rest } = order;
    return rest;
  });

  res.json({
    count: count,
    next: nextUrl,
    previous: previousUrl,
    results: sanitizedResults,
  });
});

/**
 * @swagger
 * /order/{order_pk}/:
 *   get:
 *     summary: 특정 주문 상세 조회
 *     description: 주문 ID로 특정 주문의 상세 정보를 조회합니다. 본인의 주문만 조회 가능합니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_pk
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 주문의 ID
 *     responses:
 *       '200':
 *         description: 주문 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 order_number:
 *                   type: string
 *                 payment_method:
 *                   type: string
 *                   enum: [card, deposit, phone, naverpay, kakaopay]
 *                 order_status:
 *                   type: string
 *                   enum: [payment_pending, payment_complete, preparing, shipping, delivered, cancled]
 *                 order_type:
 *                   type: string
 *                   enum: [direct_order, cart_order]
 *                 total_price:
 *                   type: integer
 *                 order_items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: object
 *                       ordered_quantity:
 *                         type: integer
 *                       ordered_unit_price:
 *                         type: integer
 *                       ordered_shipping_fee:
 *                         type: integer
 *                       item_total_price:
 *                         type: integer
 *                 receiver:
 *                   type: string
 *                 receiver_phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 delivery_message:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 주문을 찾을 수 없거나 접근 권한이 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "No Order matches the given query."
 */
apiRouter.get("/order/:order_pk/", checkAuth, (req, res) => {
  const orderPk = parseInt(req.params.order_pk, 10);
  const db = router.db;
  const username = req.user.userId;

  // 주문 조회
  const order = db.get("orders").find({ id: orderPk }).value();

  // 주문이 없거나 다른 유저의 주문인 경우
  if (!order || order.username !== username) {
    return res
      .status(404)
      .json({ detail: "No Order matches the given query." });
  }

  // username 제거하고 응답
  const { username: _, ...responseOrder } = order;
  res.status(200).json(responseOrder);
});

/**
 * @swagger
 * /order/{order_pk}/:
 *   delete:
 *     summary: 주문 취소
 *     description: 특정 주문을 취소합니다. 본인의 주문만 취소할 수 있습니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_pk
 *         required: true
 *         schema:
 *           type: integer
 *         description: 취소할 주문의 ID
 *     responses:
 *       '200':
 *         description: 주문 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "주문이 성공적으로 취소되었습니다."
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 주문을 찾을 수 없거나 접근 권한이 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detail:
 *                   type: string
 *                   example: "No Order matches the given query."
 */
apiRouter.delete("/order/:order_pk/", checkAuth, (req, res) => {
  const orderPk = parseInt(req.params.order_pk, 10);
  const db = router.db;
  const username = req.user.userId;

  // 주문 조회
  const order = db.get("orders").find({ id: orderPk }).value();

  // 주문이 없거나 다른 유저의 주문인 경우
  if (!order || order.username !== username) {
    return res
      .status(404)
      .json({ detail: "No Order matches the given query." });
  }

  // 주문 삭제
  db.get("orders").remove({ id: orderPk }).write();

  res.status(200).json({ detail: "주문이 성공적으로 취소되었습니다." });
});

// API Router를 /api prefix로 등록
server.use("/api", apiRouter);

// 다른 모든 요청은 json-server의 기본 라우터가 처리
server.use(router);

// Vercel용 export
module.exports = server;

// 로컬 개발용 (직접 실행 시에만 listen)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}
