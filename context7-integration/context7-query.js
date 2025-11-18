/**
 * Context7 Integration for Cursor Query Enhancement
 *
 * This module provides functionality to query Context7 for relevant documentation
 * before processing user queries in Cursor.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class Context7Query {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'https://api.context7.ai',
      apiKey: config.apiKey || process.env.CONTEXT7_API_KEY,
      timeout: config.timeout || 10000,
      maxResults: config.maxResults || 5,
      ...config
    };
  }

  /**
   * Query Context7 for relevant documentation based on user query
   * @param {string} query - The user's query
   * @returns {Promise<Object>} - Object containing results or no-docs message
   */
  async queryDocumentation(query) {
    try {
      // Validate input
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return {
          success: false,
          message: 'Invalid query provided',
          data: null
        };
      }

      // Clean and prepare the query
      const cleanQuery = query.trim().toLowerCase();

      // Search for relevant documentation using Context7
      const context7Results = await this.searchContext7(cleanQuery);

      if (context7Results && context7Results.length > 0) {
        return {
          success: true,
          message: `Found ${context7Results.length} relevant documentation(s)`,
          data: context7Results
        };
      } else {
        return {
          success: false,
          message: 'No docs found in context7',
          data: null
        };
      }
    } catch (error) {
      console.error('Error querying Context7:', error);
      return {
        success: false,
        message: 'Error querying documentation service',
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Search Context7 API for relevant documentation
   * @param {string} query - The search query
   * @returns {Promise<Array>} - Array of relevant documents
   */
  async searchContext7(query) {
    return new Promise((resolve, reject) => {
      const searchUrl = `${this.config.apiUrl}/search`;
      const requestData = JSON.stringify({
        query: query,
        limit: this.config.maxResults,
        format: 'json'
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Cursor-Context7-Integration/1.0'
        }
      };

      const req = https.request(searchUrl, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode === 200) {
              // Format the results
              const formattedResults = response.results?.map(doc => ({
                title: doc.title || 'Untitled Document',
                content: doc.content || doc.text || '',
                url: doc.url || doc.link || '',
                score: doc.score || doc.relevance || 0,
                source: doc.source || 'Context7'
              })) || [];

              resolve(formattedResults);
            } else {
              reject(new Error(`Context7 API error: ${res.statusCode} - ${response.message || 'Unknown error'}`));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Context7 response: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Context7 API request timeout'));
      });

      req.setTimeout(this.config.timeout);
      req.write(requestData);
      req.end();
    });
  }

  /**
   * Format the Context7 results for display to the user
   * @param {Object} result - The result object from queryDocumentation
   * @returns {string} - Formatted response string
   */
  formatResponse(result) {
    if (!result.success) {
      return result.message;
    }

    const { data } = result;
    let response = `Found ${data.length} relevant documentation(s):\n\n`;

    data.forEach((doc, index) => {
      response += `**${index + 1}. ${doc.title}**\n`;
      response += `Relevance: ${doc.score}\n`;

      if (doc.content) {
        const preview = doc.content.length > 300 ? doc.content.substring(0, 300) + '...' : doc.content;
        response += `Preview: ${preview}\n`;
      }

      if (doc.url) {
        response += `Source: ${doc.url}\n`;
      }

      response += '\n';
    });

    return response;
  }

  /**
   * Save query and results to cache for future reference
   * @param {string} query - The original query
   * @param {Object} result - The query result
   */
  cacheResult(query, result) {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cacheFile = path.join(cacheDir, `${Date.now()}-${Buffer.from(query).toString('base64').slice(0, 20)}.json`);
    const cacheData = {
      query,
      result,
      timestamp: new Date().toISOString()
    };

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn('Failed to cache result:', error.message);
    }
  }

  /**
   * Get cached results for a query (if available and recent)
   * @param {string} query - The search query
   * @param {number} maxAge - Maximum age of cache in milliseconds (default: 1 hour)
   * @returns {Object|null} - Cached result or null
   */
  getCachedResult(query, maxAge = 3600000) {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
      return null;
    }

    const cacheFiles = fs.readdirSync(cacheDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(cacheDir, a));
        const statB = fs.statSync(path.join(cacheDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });

    for (const file of cacheFiles) {
      try {
        const cachePath = path.join(cacheDir, file);
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

        // Check if query matches (case-insensitive)
        if (cacheData.query && cacheData.query.toLowerCase() === query.toLowerCase()) {
          const cacheTime = new Date(cacheData.timestamp).getTime();
          const now = new Date().getTime();

          // Return if cache is fresh enough
          if (now - cacheTime < maxAge) {
            return cacheData.result;
          } else {
            // Remove stale cache file
            fs.unlinkSync(cachePath);
          }
        }
      } catch (error) {
        // Remove corrupted cache file
        try {
          fs.unlinkSync(path.join(cacheDir, file));
        } catch (unlinkError) {
          // Ignore unlink errors
        }
      }
    }

    return null;
  }
}

module.exports = Context7Query;