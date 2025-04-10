import { Visitor } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';

class VisitorAnalyticsService {
  /**
   * Get visitor counts by date range
   */
  async getVisitorCountsByDateRange(startDate: Date, endDate: Date) {
    try {
      // Get total visitors in date range
      const totalVisitors = await Visitor.count({
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Get unique visitors (by sessionId) in date range
      const uniqueVisitors = await Visitor.count({
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        distinct: true,
        col: 'sessionId'
      });

      // Get daily visitor counts
      const dailyVisitors = await Visitor.findAll({
        attributes: [
          [sequelize.fn('date_trunc', 'day', sequelize.col('visitDate')), 'date'],
          [sequelize.fn('count', sequelize.col('id')), 'count']
        ],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn('date_trunc', 'day', sequelize.col('visitDate'))],
        order: [[sequelize.fn('date_trunc', 'day', sequelize.col('visitDate')), 'ASC']],
        raw: true
      });

      return {
        totalVisitors,
        uniqueVisitors,
        dailyVisitors: dailyVisitors.map((item: any) => ({
          date: item.date,
          count: parseInt(item.count)
        }))
      };
    } catch (error) {
      console.error('Error getting visitor counts:', error);
      throw error;
    }
  }

  /**
   * Get visitor counts by page
   */
  async getVisitorCountsByPage(startDate: Date, endDate: Date) {
    try {
      const pageVisits = await Visitor.findAll({
        attributes: [
          'path',
          [sequelize.fn('count', sequelize.col('id')), 'count']
        ],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: ['path'],
        order: [[sequelize.fn('count', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      return pageVisits.map((item: any) => ({
        path: item.path,
        count: parseInt(item.count)
      }));
    } catch (error) {
      console.error('Error getting visitor counts by page:', error);
      throw error;
    }
  }

  /**
   * Get visitor counts by country
   */
  async getVisitorCountsByCountry(startDate: Date, endDate: Date) {
    try {
      const countryVisits = await Visitor.findAll({
        attributes: [
          'country',
          [sequelize.fn('count', sequelize.col('id')), 'count']
        ],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          },
          country: {
            [Op.not]: null
          }
        },
        group: ['country'],
        order: [[sequelize.fn('count', sequelize.col('id')), 'DESC']],
        raw: true
      });

      // Calculate total for percentage
      const total = countryVisits.reduce((sum: number, item: any) => sum + parseInt(item.count), 0);

      return countryVisits.map((item: any) => ({
        country: item.country,
        count: parseInt(item.count),
        percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0
      }));
    } catch (error) {
      console.error('Error getting visitor counts by country:', error);
      throw error;
    }
  }

  /**
   * Get visitor counts by referrer
   */
  async getVisitorCountsByReferrer(startDate: Date, endDate: Date) {
    try {
      const referrerVisits = await Visitor.findAll({
        attributes: [
          'referrer',
          [sequelize.fn('count', sequelize.col('id')), 'count']
        ],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          },
          referrer: {
            [Op.not]: null
          }
        },
        group: ['referrer'],
        order: [[sequelize.fn('count', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Process referrers to extract domains
      return referrerVisits.map((item: any) => {
        let domain = item.referrer;
        try {
          const url = new URL(item.referrer);
          domain = url.hostname;
        } catch (e) {
          // If parsing fails, use the original referrer
        }

        return {
          referrer: domain,
          count: parseInt(item.count)
        };
      });
    } catch (error) {
      console.error('Error getting visitor counts by referrer:', error);
      throw error;
    }
  }

  /**
   * Get visitor counts by device type (estimated from user agent)
   */
  async getVisitorCountsByDevice(startDate: Date, endDate: Date) {
    try {
      const visitors = await Visitor.findAll({
        attributes: ['userAgent'],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        raw: true
      });

      // Categorize devices based on user agent
      const deviceCounts = {
        mobile: 0,
        tablet: 0,
        desktop: 0
      };

      visitors.forEach((visitor: any) => {
        const userAgent = visitor.userAgent.toLowerCase();
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          deviceCounts.mobile++;
        } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
          deviceCounts.tablet++;
        } else {
          deviceCounts.desktop++;
        }
      });

      const total = deviceCounts.mobile + deviceCounts.tablet + deviceCounts.desktop;

      return [
        {
          device: 'Mobile',
          count: deviceCounts.mobile,
          percentage: total > 0 ? Math.round((deviceCounts.mobile / total) * 100) : 0
        },
        {
          device: 'Tablet',
          count: deviceCounts.tablet,
          percentage: total > 0 ? Math.round((deviceCounts.tablet / total) * 100) : 0
        },
        {
          device: 'Desktop',
          count: deviceCounts.desktop,
          percentage: total > 0 ? Math.round((deviceCounts.desktop / total) * 100) : 0
        }
      ];
    } catch (error) {
      console.error('Error getting visitor counts by device:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive visitor analytics
   */
  async getVisitorAnalytics(period: string = '7d') {
    try {
      // Calculate date range based on period
      const endDate = new Date();
      let startDate: Date;
      
      switch (period) {
        case '30d':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '7d':
        default:
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 7);
          break;
      }

      // Get all analytics data
      const [counts, pageVisits, countryVisits, referrerVisits, deviceCounts] = await Promise.all([
        this.getVisitorCountsByDateRange(startDate, endDate),
        this.getVisitorCountsByPage(startDate, endDate),
        this.getVisitorCountsByCountry(startDate, endDate),
        this.getVisitorCountsByReferrer(startDate, endDate),
        this.getVisitorCountsByDevice(startDate, endDate)
      ]);

      // Calculate bounce rate (estimated as single-page visits)
      // Use findAll with a subquery to get sessions with only one page visit
      const singlePageVisitsQuery = await Visitor.findAll({
        attributes: [
          'sessionId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'visitCount']
        ],
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: ['sessionId'],
        having: sequelize.where(sequelize.fn('COUNT', sequelize.col('id')), '=', 1),
        raw: true
      });
      
      const singlePageVisits = singlePageVisitsQuery.length;

      const totalSessions = await Visitor.count({
        distinct: true,
        col: 'sessionId',
        where: {
          visitDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const bounceRate = totalSessions > 0 
        ? Math.round((singlePageVisits / totalSessions) * 100) 
        : 0;

      // Estimate average session duration (in seconds)
      // This is a simplified calculation - in a real system you'd track actual session durations
      const averageSessionDuration = 180; // 3 minutes as a placeholder

      return {
        totalVisitors: counts.totalVisitors,
        uniqueVisitors: counts.uniqueVisitors,
        dailyVisitors: counts.dailyVisitors,
        pageVisits,
        visitorsByCountry: countryVisits,
        referrerVisits,
        deviceCounts,
        bounceRate,
        averageSessionDuration,
        conversionRate: 3.2, // Placeholder - would be calculated from actual conversions
        nonPurchasingVisitors: Math.round(counts.uniqueVisitors * 0.968) // Based on 3.2% conversion rate
      };
    } catch (error) {
      console.error('Error getting visitor analytics:', error);
      throw error;
    }
  }
}

export default new VisitorAnalyticsService();
