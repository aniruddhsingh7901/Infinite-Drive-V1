import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Visitor } from '../models';
import axios from 'axios';
import NodeCache from 'node-cache';

// Simple in-memory cache for IP geolocation data
// Cache IP location data for 24 hours
const locationCache = new NodeCache({ stdTTL: 86400 });

// Function to get visitor's country and city using IP geolocation
const getLocationFromIP = async (ip: string) => {
  try {
    // Skip for localhost or private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Development' };
    }
    
    // Check if we have cached data for this IP
    const cachedLocation = locationCache.get(ip);
    if (cachedLocation) {
      return cachedLocation as { country: string | null; city: string | null };
    }
    
    // Clean the IP address (remove IPv6 parts if mixed format)
    const cleanIp = ip.includes(',') ? ip.split(',')[0].trim() : ip;
    
    // Use a free IP geolocation service with rate limiting
    const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`, {
      timeout: 3000, // 3 second timeout
      headers: {
        'User-Agent': 'InfiniteDrive/1.0'
      }
    });
    
    // Check if we got a rate limit error
    if (response.status === 429) {
      console.log('IP geolocation rate limit reached, using null values');
      return { country: null, city: null };
    }
    
    const data = response.data as { country_name: string; city: string };
    const locationData = {
      country: data.country_name,
      city: data.city
    };
    
    // Cache the result
    locationCache.set(ip, locationData);
    
    return locationData;
  } catch (error: any) {
    // If it's a rate limit error (429), log it differently
    if (error.response && error.response.status === 429) {
      console.log('IP geolocation rate limit reached, using null values');
    } else {
      console.error('Error getting location from IP:', error);
    }
    
    // Cache the null result to avoid repeated failed requests
    locationCache.set(ip, { country: null, city: null }, 3600); // Cache for 1 hour
    
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
