import jsonwebtoken from "jsonwebtoken";

function middleware(req, res, next) {
    const token = req.cookies.auth_token;

    if (token === undefined) return res.status(401).json({ error: "Unauthorized" });
    
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });

        req.user = decoded.sub;
        next();
    });
}

export default middleware;