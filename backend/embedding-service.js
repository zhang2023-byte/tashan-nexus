// DeepSeek Embedding 服务
const axios = require('axios');

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'sk-ab4d196871d8494a800f56912d275be2';
    this.apiUrl = 'https://api.deepseek.com/v1/embeddings';
    this.model = 'deepseek-embedding';
    this.cache = new Map(); // 简单内存缓存
  }

  // 生成单个文本的embedding
  async generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
      return null;
    }

    // 检查缓存
    const cacheKey = text.trim();
    if (this.cache.has(cacheKey)) {
      console.log('[Embedding] 使用缓存');
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`[Embedding] 生成向量，文本长度: ${text.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          input: text
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒超时
        }
      );

      const embedding = response.data.data[0].embedding;

      // 缓存结果
      this.cache.set(cacheKey, embedding);

      console.log(`[Embedding] 成功生成 ${embedding.length} 维向量`);
      return embedding;

    } catch (error) {
      console.error('[Embedding] 生成失败:', error.message);
      if (error.response) {
        console.error('[Embedding] API响应:', error.response.data);
      }
      return null;
    }
  }

  // 批量生成embedding（为用户的多个字段生成）
  async generateUserEmbeddings(user) {
    console.log(`[Embedding] 为用户 ${user.name} 生成embeddings`);

    const embeddings = {
      skills: null,
      interests: null,
      needs: null,
      looking_for: null
    };

    try {
      // 并行生成所有字段的embedding
      const [skills, interests, needs, looking_for] = await Promise.all([
        this.generateEmbedding(user.skills || ''),
        this.generateEmbedding(user.interests || ''),
        this.generateEmbedding(user.needs || ''),
        this.generateEmbedding(user.looking_for || '')
      ]);

      embeddings.skills = skills;
      embeddings.interests = interests;
      embeddings.needs = needs;
      embeddings.looking_for = looking_for;

      console.log('[Embedding] 用户embeddings生成完成');
      return embeddings;

    } catch (error) {
      console.error('[Embedding] 批量生成失败:', error.message);
      return embeddings;
    }
  }

  // 计算两个向量的余弦相似度
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude1 = Math.sqrt(norm1);
    const magnitude2 = Math.sqrt(norm2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  // 使用embedding计算用户匹配度
  calculateMatchScore(user1Embeddings, user2Embeddings) {
    let totalScore = 0;
    let validScores = 0;

    // 1. 技能与需求匹配 (权重: 40%)
    if (user1Embeddings.skills && user2Embeddings.needs) {
      const skillNeedScore = this.cosineSimilarity(
        user1Embeddings.skills,
        user2Embeddings.needs
      );
      totalScore += skillNeedScore * 0.4;
      validScores += 0.4;
    }

    // 2. 兴趣相似度 (权重: 30%)
    if (user1Embeddings.interests && user2Embeddings.interests) {
      const interestScore = this.cosineSimilarity(
        user1Embeddings.interests,
        user2Embeddings.interests
      );
      totalScore += interestScore * 0.3;
      validScores += 0.3;
    }

    // 3. 双向需求匹配 (权重: 20%)
    if (user1Embeddings.looking_for && user2Embeddings.skills) {
      const lookingForMatch = this.cosineSimilarity(
        user1Embeddings.looking_for,
        user2Embeddings.skills
      );
      totalScore += lookingForMatch * 0.2;
      validScores += 0.2;
    }

    // 4. 反向需求匹配 (权重: 10%)
    if (user1Embeddings.needs && user2Embeddings.skills) {
      const needSkillScore = this.cosineSimilarity(
        user1Embeddings.needs,
        user2Embeddings.skills
      );
      totalScore += needSkillScore * 0.1;
      validScores += 0.1;
    }

    return validScores > 0 ? totalScore / validScores : 0;
  }

  // 生成基于embedding的匹配原因
  getMatchReasons(user1, user1Embeddings, user2, user2Embeddings) {
    const reasons = [];

    // 技能-需求匹配
    if (user1Embeddings.skills && user2Embeddings.needs) {
      const score = this.cosineSimilarity(user1Embeddings.skills, user2Embeddings.needs);
      if (score > 0.3) {
        reasons.push(`你的技能与对方需求高度匹配 (相似度: ${(score * 100).toFixed(1)}%)`);
      }
    }

    // 兴趣相似度
    if (user1Embeddings.interests && user2Embeddings.interests) {
      const score = this.cosineSimilarity(user1Embeddings.interests, user2Embeddings.interests);
      if (score > 0.3) {
        reasons.push(`你们有相似的研究兴趣 (相似度: ${(score * 100).toFixed(1)}%)`);
      }
    }

    // 期望合作者匹配
    if (user1Embeddings.looking_for && user2Embeddings.skills) {
      const score = this.cosineSimilarity(user1Embeddings.looking_for, user2Embeddings.skills);
      if (score > 0.3) {
        reasons.push(`对方的技能符合你的期望 (匹配度: ${(score * 100).toFixed(1)}%)`);
      }
    }

    // 需求-技能反向匹配
    if (user1Embeddings.needs && user2Embeddings.skills) {
      const score = this.cosineSimilarity(user1Embeddings.needs, user2Embeddings.skills);
      if (score > 0.3) {
        reasons.push(`对方可以帮助解决你的需求 (匹配度: ${(score * 100).toFixed(1)}%)`);
      }
    }

    if (reasons.length === 0) {
      reasons.push('基于语义分析发现潜在合作机会');
    }

    return reasons;
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
    console.log('[Embedding] 缓存已清除');
  }
}

module.exports = new EmbeddingService();
