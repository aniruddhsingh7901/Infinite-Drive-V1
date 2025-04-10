import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Visitor } from '../models';
import axios from 'axios';

// Function to get visitor's country and city using IP geolocation
const getLocationFromIP = async (ip: string) => {
  try {
    // Skip for localhost or private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Development' };
    }
    
    // Use a free IP geolocation service
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = response.data as { country_name: string; city: string };
    return {
      country: data.country_name,
      city: data.city
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return { country: null, city: null };
  }
};

export const trackVisitor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip tracking for API requests, static files, and admin routes
    const path = req.path;
    if (
      path.startsWith('/api/') || 
      path.startsWith('/static/') || 
      path.includes('.') || 
      path.startsWith('/admin/')
    ) {
      return next();
    }

    // Get visitor IP
    const ip = req.headers['x-forwarded-for'] as string || 
               req.socket.remoteAddress || 
               'unknown';
    
    // Get or create session ID from cookie
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    // Get location data
    const { country, city } = await getLocationFromIP(ip);

    // Create visitor record
    await Visitor.create({
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      path,
      referrer: req.headers.referer || null,
      country,
      city,
      sessionId,
      visitDate: new Date()
    });

    next();
  } catch (error) {
    console.error('Error tracking visitor:', error);
    // Continue even if tracking fails
    next();
  }
};

export default trackVisitor;
