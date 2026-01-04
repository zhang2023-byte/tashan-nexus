// 混合智能匹配引擎 - Embedding快速筛选 + LLM深度分析
const embeddingService = require('./embedding-service');
const llmService = require('./llm-service');
const MatchingEngine = require('./matching'); // 原算法作为降级备份

class HybridMatchingEngine {
  constructor() {
    this.useEmbedding = true; // 是否使用embedding
    this.useLLM = true; // 是否使用LLM深度分析
    this.llmTopN = 10; // 对前N个候选使用LLM分析
    this.finalTopN = 3; // 返回最终前N个匹配
  }

  // 主匹配方法
  async findMatches(currentUser, allUsers) {
    console.log(`\n========== 开始混合智能匹配 ==========`);
    console.log(`当前用户: ${currentUser.name}`);
    console.log(`候选用户数: ${allUsers.length}`);

    try {
      // 阶段1: Embedding快速筛选
      const embeddingMatches = await this.embeddingPhase(currentUser, allUsers);
      console.log(`[阶段1] Embedding筛选完成，找到 ${embeddingMatches.length} 个候选`);

      if (embeddingMatches.length === 0) {
        console.log('[结果] 未找到匹配用户');
        return [];
      }

      // 阶段2: LLM深度分析前N个
      const topCandidates = embeddingMatches.slice(0, this.llmTopN);
      console.log(`[阶段2] 对前 ${topCandidates.length} 个候选进行LLM深度分析...`);

      const llmMatches = await this.llmPhase(currentUser, topCandidates);
      console.log(`[阶段2] LLM分析完成`);

      // 阶段3: 合并结果，返回前3个
      const finalMatches = this.mergeLLMAndEmbedding(llmMatches, embeddingMatches);
      const topMatches = finalMatches.slice(0, this.finalTopN);

      console.log(`[阶段3] 最终返回 ${topMatches.length} 个最佳匹配`);
      console.log(`========== 匹配完成 ==========\n`);

      return topMatches;

    } catch (error) {
      console.error('[混合匹配] 出错，降级到基础算法:', error.message);
      // 降级到原算法
      return await MatchingEngine.findMatches(currentUser, allUsers, 0.0);
    }
  }

  // 阶段1: 使用Embedding进行快速语义匹配
  async embeddingPhase(currentUser, allUsers) {
    if (!this.useEmbedding) {
      console.log('[Embedding] 未启用，使用基础匹配算法生成候选列表');
      // 使用基础匹配算法
      const matches = [];
      for (const user of allUsers) {
        if (user.id === currentUser.id) continue;
        const score = MatchingEngine.calculateMatchScore(currentUser, user);
        matches.push({
          user: user,
          score: score,
          source: 'basic'
        });
      }
      // 按匹配度排序
      matches.sort((a, b) => b.score - a.score);
      return matches;
    }

    // 获取当前用户的embeddings
    const currentEmbeddings = this.getUserEmbeddings(currentUser);

    // 如果没有embeddings，先生成
    if (!this.hasValidEmbeddings(currentEmbeddings)) {
      console.log('[Embedding] 当前用户缺少embeddings，正在生成...');
      const newEmbeddings = await embeddingService.generateUserEmbeddings(currentUser);
      Object.assign(currentEmbeddings, newEmbeddings);
    }

    const matches = [];

    for (const user of allUsers) {
      if (user.id === currentUser.id) continue;

      // 获取候选用户的embeddings
      let userEmbeddings = this.getUserEmbeddings(user);

      // 如果缺少embeddings，使用原算法计算
      if (!this.hasValidEmbeddings(userEmbeddings)) {
        const score = MatchingEngine.calculateMatchScore(currentUser, user);
        matches.push({
          user: user,
          score: score,
          source: 'fallback'
        });
        continue;
      }

      // 使用embedding计算匹配度
      const score = embeddingService.calculateMatchScore(currentEmbeddings, userEmbeddings);
      const reasons = embeddingService.getMatchReasons(currentUser, currentEmbeddings, user, userEmbeddings);

      matches.push({
        user: user,
        score: score,
        reasons: reasons,
        source: 'embedding',
        embeddings: userEmbeddings
      });
    }

    // 按匹配度排序
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  // 阶段2: 使用LLM对高分候选进行深度分析
  async llmPhase(currentUser, candidates) {
    if (!this.useLLM || candidates.length === 0) {
      console.log('[LLM] 未启用或无候选，跳过');
      return candidates;
    }

    try {
      const llmResults = await llmService.analyzeMultipleMatches(currentUser, candidates, 5);
      return llmResults;
    } catch (error) {
      console.error('[LLM] 批量分析失败，使用基础结果:', error.message);
      return candidates;
    }
  }

  // 阶段3: 合并LLM和Embedding结果
  mergeLLMAndEmbedding(llmMatches, embeddingMatches) {
    const merged = [];

    // 处理LLM分析过的用户
    const llmUserIds = new Set(llmMatches.map(m => m.user.id));

    for (const match of llmMatches) {
      merged.push({
        user: match.user,
        match_score: match.final_score || match.llm_score || match.embedding_score,
        embedding_score: match.embedding_score,
        llm_score: match.llm_score,
        reasons: match.reasons || [],
        collaboration_suggestions: match.collaboration_suggestions || [],
        potential_projects: match.potential_projects || [],
        analyzed_by_llm: true
      });
    }

    // 添加未被LLM分析的用户（从embedding结果中）
    for (const match of embeddingMatches) {
      if (!llmUserIds.has(match.user.id)) {
        merged.push({
          user: match.user,
          match_score: match.score,
          embedding_score: match.score,
          llm_score: null,
          reasons: match.reasons || ['基于语义相似度匹配'],
          collaboration_suggestions: [],
          potential_projects: [],
          analyzed_by_llm: false
        });
      }
    }

    // 按最终匹配度排序
    merged.sort((a, b) => b.match_score - a.match_score);

    return merged;
  }

  // 从用户对象中提取embeddings
  getUserEmbeddings(user) {
    return {
      skills: this.parseEmbedding(user.skills_embedding),
      interests: this.parseEmbedding(user.interests_embedding),
      needs: this.parseEmbedding(user.needs_embedding),
      looking_for: this.parseEmbedding(user.looking_for_embedding)
    };
  }

  // 解析JSON格式的embedding
  parseEmbedding(embeddingStr) {
    if (!embeddingStr) return null;
    try {
      return JSON.parse(embeddingStr);
    } catch (error) {
      return null;
    }
  }

  // 检查embeddings是否有效
  hasValidEmbeddings(embeddings) {
    return embeddings.skills || embeddings.interests || embeddings.needs || embeddings.looking_for;
  }

  // 配置方法
  configure(options) {
    if (options.useEmbedding !== undefined) {
      this.useEmbedding = options.useEmbedding;
    }
    if (options.useLLM !== undefined) {
      this.useLLM = options.useLLM;
    }
    if (options.llmTopN !== undefined) {
      this.llmTopN = options.llmTopN;
    }
    if (options.finalTopN !== undefined) {
      this.finalTopN = options.finalTopN;
    }

    console.log('[配置] 混合匹配引擎配置:', {
      useEmbedding: this.useEmbedding,
      useLLM: this.useLLM,
      llmTopN: this.llmTopN,
      finalTopN: this.finalTopN
    });
  }
}

module.exports = new HybridMatchingEngine();
