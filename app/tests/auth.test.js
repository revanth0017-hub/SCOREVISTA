// Authentication Unit Tests
// Simplified auth functions based on backend/src/controllers/authController.js
// Self-contained with no external imports

// Mock database - stores registered users
let mockUserDatabase = {};

// Simplified password comparison (in real app, uses bcrypt)
function comparePassword(storedPassword, providedPassword) {
  return storedPassword === providedPassword;
}

// Simplified registerUser function
// Returns { status, message, user } for testing
function registerUser(email, password, name) {
  // Validate required fields
  if (!email || !password) {
    return {
      status: 400,
      message: 'Email and password required',
      user: null
    };
  }

  // Check if user already exists
  if (mockUserDatabase[email]) {
    return {
      status: 409,
      message: 'Email already registered',
      user: null
    };
  }

  // Create new user
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: name || email.split('@')[0],
    password, // In real app, this would be hashed
    role: 'user'
  };

  // Store in mock database
  mockUserDatabase[email] = { ...newUser };

  return {
    status: 201,
    message: 'Registered successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  };
}

// Simplified loginUser function
// Returns { status, message, user } for testing
function loginUser(email, password) {
  // Validate required fields
  if (!email || !password) {
    return {
      status: 400,
      message: 'Email and password required',
      user: null
    };
  }

  // Find user in mock database
  const user = mockUserDatabase[email];

  // Check if user exists and password is correct
  if (!user || !comparePassword(user.password, password)) {
    return {
      status: 401,
      message: 'Invalid email or password',
      user: null
    };
  }

  return {
    status: 200,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

// Helper to reset mock database between tests
function resetDatabase() {
  mockUserDatabase = {};
}

// ============================================
// TEST SUITES
// ============================================

describe('registerUser Function', () => {
  beforeEach(() => {
    resetDatabase();
  });

  test('should return 400 if email is missing', () => {
    const result = registerUser('', 'password123', 'John');
    expect(result.status).toBe(400);
    expect(result.message).toBe('Email and password required');
    expect(result.user).toBeNull();
  });

  test('should return 400 if password is missing', () => {
    const result = registerUser('john@example.com', '', 'John');
    expect(result.status).toBe(400);
    expect(result.message).toBe('Email and password required');
    expect(result.user).toBeNull();
  });

  test('should return 409 if email already exists', () => {
    // Register first user
    registerUser('alice@example.com', 'password123', 'Alice');
    
    // Try to register with same email
    const result = registerUser('alice@example.com', 'newpassword456', 'Alice2');
    expect(result.status).toBe(409);
    expect(result.message).toBe('Email already registered');
    expect(result.user).toBeNull();
  });

  test('should return 201 and create user on successful registration', () => {
    const result = registerUser('bob@example.com', 'password123', 'Bob');
    expect(result.status).toBe(201);
    expect(result.message).toBe('Registered successfully');
    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe('bob@example.com');
    expect(result.user.name).toBe('Bob');
    expect(result.user.role).toBe('user');
  });

  test('should use email prefix as name if name is not provided', () => {
    const result = registerUser('charlie@example.com', 'password123');
    expect(result.status).toBe(201);
    expect(result.user.name).toBe('charlie');
  });

  test('should generate unique user ID for each registration', () => {
    const result1 = registerUser('user1@example.com', 'pass123', 'User1');
    const result2 = registerUser('user2@example.com', 'pass123', 'User2');
    expect(result1.user.id).not.toBe(result2.user.id);
  });
});

describe('loginUser Function', () => {
  beforeEach(() => {
    resetDatabase();
    // Register a test user before each login test
    registerUser('test@example.com', 'correctpassword', 'TestUser');
  });

  test('should return 400 if email is missing', () => {
    const result = loginUser('', 'correctpassword');
    expect(result.status).toBe(400);
    expect(result.message).toBe('Email and password required');
    expect(result.user).toBeNull();
  });

  test('should return 400 if password is missing', () => {
    const result = loginUser('test@example.com', '');
    expect(result.status).toBe(400);
    expect(result.message).toBe('Email and password required');
    expect(result.user).toBeNull();
  });

  test('should return 401 if user does not exist', () => {
    const result = loginUser('nonexistent@example.com', 'password123');
    expect(result.status).toBe(401);
    expect(result.message).toBe('Invalid email or password');
    expect(result.user).toBeNull();
  });

  test('should return 401 if password is incorrect', () => {
    const result = loginUser('test@example.com', 'wrongpassword');
    expect(result.status).toBe(401);
    expect(result.message).toBe('Invalid email or password');
    expect(result.user).toBeNull();
  });

  test('should return 200 and user data on successful login', () => {
    const result = loginUser('test@example.com', 'correctpassword');
    expect(result.status).toBe(200);
    expect(result.message).toBe('Login successful');
    expect(result.user).not.toBeNull();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('TestUser');
    expect(result.user.role).toBe('user');
  });

  test('should not return password in user data', () => {
    const result = loginUser('test@example.com', 'correctpassword');
    expect(result.user.password).toBeUndefined();
  });
});

describe('Full Authentication Flow - Integration Test', () => {
  beforeEach(() => {
    resetDatabase();
  });

  test('should complete full auth flow: register → login → access protected resource', () => {
    // Step 1: New user registers
    const registerResult = registerUser('newuser@example.com', 'securepass123', 'NewUser');
    expect(registerResult.status).toBe(201);
    expect(registerResult.user.email).toBe('newuser@example.com');
    const userId = registerResult.user.id;

    // Step 2: User returns and logs in with correct credentials
    const loginResult = loginUser('newuser@example.com', 'securepass123');
    expect(loginResult.status).toBe(200);
    expect(loginResult.user.id).toBe(userId);
    expect(loginResult.user.email).toBe('newuser@example.com');

    // Step 3: Simulate accessing protected resource with user info
    // (In real app, this would use the token from loginResult)
    const isAuthorized = loginResult.user.role === 'user' && loginResult.user.id === userId;
    expect(isAuthorized).toBe(true);
  });

  test('should prevent attacker from logging in after failed registration attempt', () => {
    // Step 1: Attacker tries to register with incomplete info
    const registerResult = registerUser('attacker@example.com', ''); // No password
    expect(registerResult.status).toBe(400);

    // Step 2: Attempt to login should fail (user never created)
    const loginResult = loginUser('attacker@example.com', 'anypassword');
    expect(loginResult.status).toBe(401);
  });

  test('should handle multiple users registration and login correctly', () => {
    // Register multiple users
    const user1 = registerUser('alice@example.com', 'pass1', 'Alice');
    const user2 = registerUser('bob@example.com', 'pass2', 'Bob');
    const user3 = registerUser('charlie@example.com', 'pass3', 'Charlie');

    expect(user1.status).toBe(201);
    expect(user2.status).toBe(201);
    expect(user3.status).toBe(201);

    // Each user logs in successfully with their own credentials
    const login1 = loginUser('alice@example.com', 'pass1');
    const login2 = loginUser('bob@example.com', 'pass2');
    const login3 = loginUser('charlie@example.com', 'pass3');

    expect(login1.status).toBe(200);
    expect(login1.user.name).toBe('Alice');
    expect(login2.status).toBe(200);
    expect(login2.user.name).toBe('Bob');
    expect(login3.status).toBe(200);
    expect(login3.user.name).toBe('Charlie');

    // Cross-login attempts fail (Alice cannot login with Bob's password)
    const crossLogin = loginUser('alice@example.com', 'pass2');
    expect(crossLogin.status).toBe(401);
  });

  test('should reject duplicate registration but allow original user to login', () => {
    // Step 1: Register a user
    const register1 = registerUser('john@example.com', 'mypassword', 'John');
    expect(register1.status).toBe(201);

    // Step 2: Try to register again with same email
    const register2 = registerUser('john@example.com', 'anotherpassword', 'John2');
    expect(register2.status).toBe(409);

    // Step 3: Original user can still login with original password
    const login = loginUser('john@example.com', 'mypassword');
    expect(login.status).toBe(200);
    expect(login.user.name).toBe('John');

    // Step 4: Login with the second password fails (it was never registered)
    const loginWrongPass = loginUser('john@example.com', 'anotherpassword');
    expect(loginWrongPass.status).toBe(401);
  });
});
