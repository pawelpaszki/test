import * as jwt from 'jsonwebtoken';

class JWTokenVerifier {

  public static verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).json({
        error: 'No token provided.',
      });
    }
    jwt.verify(token, process.env.SECRET || 'secret', (err) => {
      if (err) {
        return res.status(500).json({
          error: 'Unable to authenticate token.',
        });
      }
      next();
    });
  }

}

export default JWTokenVerifier;
