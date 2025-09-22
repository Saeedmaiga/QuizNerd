const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  async fetchQuestions(source = 'opentdb', options = {}) {
    const params = new URLSearchParams();
    
    if (source === 'opentdb') {
      params.set('amount', options.amount || 10);
      if (options.difficulty) params.set('difficulty', options.difficulty);
      if (options.category) params.set('category', options.category);
      if (options.type) params.set('type', options.type);
    } else if (source === 'triviaapi') {
      params.set('limit', options.limit || 10);
      if (options.difficulty) params.set('difficulty', options.difficulty);
      if (options.categories) params.set('categories', options.categories);
    }

    const response = await fetch(`${API_BASE_URL}/external/${source}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export default new ApiService();