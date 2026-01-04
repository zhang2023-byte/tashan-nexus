// DeepSeek LLM 服务 - 用于深度分析高匹配度用户
const axios = require('axios');

class LLMService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'sk-ab4d196871d8494a800f56912d275be2';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.model = 'deepseek-chat';
  }

  // 使用LLM深度分析两个用户的匹配
  async analyzeMatch(user1, user2, embeddingScore) {
    try {
      console.log(`[LLM] 深度分析: ${user1.name} <-> ${user2.name}`);

      const prompt = this.buildMatchPrompt(user1, user2, embeddingScore);

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的学术协作匹配分析专家。你需要评估两位用户的匹配度，并提供详细的合作建议。请用中文回答，返回JSON格式。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时（增加到30秒）
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log(`[LLM] 分析完成，匹配度: ${result.match_score}`);

      return {
        match_score: result.match_score || embeddingScore,
        reasons: result.reasons || [],
        collaboration_suggestions: result.collaboration_suggestions || [],
        potential_projects: result.potential_projects || []
      };

    } catch (error) {
      console.error('[LLM] 分析失败:', error.message);
      if (error.response) {
        console.error('[LLM] API响应:', error.response.data);
      }

      // 降级：返回embedding结果
      return {
        match_score: embeddingScore,
        reasons: ['基于语义分析的初步匹配'],
        collaboration_suggestions: [],
        potential_projects: []
      };
    }
  }

  // 构建匹配分析的Prompt
  buildMatchPrompt(user1, user2, embeddingScore) {
    return `请分析以下两位用户的匹配度和合作潜力：

**用户A: ${user1.name}**
- 专业: ${user1.major || '未填写'}
- 学历: ${user1.degree || '未填写'}
- 单位: ${user1.institution || '未填写'}
- 技能: ${user1.skills || '未填写'}
- 兴趣: ${user1.interests || '未填写'}
- 需求: ${user1.needs || '未填写'}
- 寻找的合作者: ${user1.looking_for || '未填写'}

**用户B: ${user2.name}**
- 专业: ${user2.major || '未填写'}
- 学历: ${user2.degree || '未填写'}
- 单位: ${user2.institution || '未填写'}
- 技能: ${user2.skills || '未填写'}
- 兴趣: ${user2.interests || '未填写'}
- 需求: ${user2.needs || '未填写'}
- 寻找的合作者: ${user2.looking_for || '未填写'}

**语义相似度（Embedding）**: ${(embeddingScore * 100).toFixed(1)}%

请返回JSON格式（不要有markdown代码块标记），包含以下字段：
{
  "match_score": 0.85,  // 0-1之间的综合匹配度，综合考虑技能互补、兴趣重叠、学科交叉潜力
  "reasons": [
    "具体的匹配原因1（说明哪些方面匹配，为什么）",
    "具体的匹配原因2",
    "具体的匹配原因3"
  ],
  "collaboration_suggestions": [
    "具体的合作建议1（可以做什么项目）",
    "具体的合作建议2"
  ],
  "potential_projects": [
    "潜在的合作项目想法1",
    "潜在的合作项目想法2"
  ]
}

注意：
1. match_score要综合评估技能互补度、研究兴趣重叠度、学科交叉创新潜力
2. reasons要具体，指出哪些技能/兴趣/需求是匹配的
3. collaboration_suggestions要实用，给出可行的合作方向
4. 如果匹配度低，reasons可以说明差距在哪里，suggestions可以给改进建议`;
  }

  // 批量分析多个匹配（限制并发）
  async analyzeMultipleMatches(user1, candidateMatches, maxConcurrent = 3) {
    console.log(`[LLM] 批量分析 ${candidateMatches.length} 个候选匹配`);

    const results = [];

    // 分批处理，避免并发过多
    for (let i = 0; i < candidateMatches.length; i += maxConcurrent) {
      const batch = candidateMatches.slice(i, i + maxConcurrent);

      const batchResults = await Promise.all(
        batch.map(match =>
          this.analyzeMatch(user1, match.user, match.score)
            .then(analysis => ({
              user: match.user,
              embedding_score: match.score,
              llm_score: analysis.match_score,
              final_score: (match.score * 0.4 + analysis.match_score * 0.6), // 40% embedding + 60% LLM
              reasons: analysis.reasons,
              collaboration_suggestions: analysis.collaboration_suggestions,
              potential_projects: analysis.potential_projects
            }))
            .catch(error => {
              console.error(`[LLM] 分析 ${match.user.name} 失败:`, error.message);
              return {
                user: match.user,
                embedding_score: match.score,
                llm_score: match.score,
                final_score: match.score,
                reasons: ['基于语义相似度的初步匹配'],
                collaboration_suggestions: [],
                potential_projects: []
              };
            })
        )
      );

      results.push(...batchResults);
    }

    return results;
  }
}

module.exports = new LLMService();
