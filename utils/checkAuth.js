import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (!token) {
    console.log('No token provided in request');
    return res.status(403).json({
      message: 'No token provided',
    });
  }

  try {
    console.log('Verifying token:', token.slice(0, 20) + '...');
    const decoded = jwt.verify(token, "secret");
    console.log('Token decoded, userId:', decoded._id);
    req.userId = decoded._id;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({
      message: 'Invalid token',
    });
  }
};