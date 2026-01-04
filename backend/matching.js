// AI匹配算法 - 基于文本相似度
class MatchingEngine {
  // 计算两个文本的余弦相似度
  static cosineSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const allWords = new Set([...words1, ...words2]);
    const vector1 = [];
    const vector2 = [];

    allWords.forEach(word => {
      vector1.push(words1.filter(w => w === word).length);
      vector2.push(words2.filter(w => w === word).length);
    });

    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
  }

  // 简单的中文分词
  static tokenize(text) {
    if (!text) return [];
    // 移除标点符号，分割成字符
    return text.toLowerCase()
      .replace(/[，。！？、；：""''（）《》【】\s,\.!?;:'"()\[\]{}]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  // 计算两个用户的匹配度
  static calculateMatchScore(user1, user2) {
    let totalScore = 0;
    let weightSum = 0;

    // 1. 技能与需求匹配 (权重: 40%)
    const skillNeedScore = this.cosineSimilarity(
      user1.skills || '',
      user2.needs || ''
    );
    totalScore += skillNeedScore * 0.4;
    weightSum += 0.4;

    // 2. 兴趣相似度 (权重: 30%)
    const interestScore = this.cosineSimilarity(
      user1.interests || '',
      user2.interests || ''
    );
    totalScore += interestScore * 0.3;
    weightSum += 0.3;

    // 3. 双向需求匹配 (权重: 20%)
    const lookingForMatch = this.cosineSimilarity(
      user1.looking_for || '',
      user2.skills || ''
    );
    totalScore += lookingForMatch * 0.2;
    weightSum += 0.2;

    // 4. 专业背景相关性 (权重: 10%)
    const majorScore = this.cosineSimilarity(
      user1.major || '',
      user2.major || ''
    );
    totalScore += majorScore * 0.1;
    weightSum += 0.1;

    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  // 为用户寻找匹配者
  static async findMatches(currentUser, allUsers, minScore = 0.0) {
    const matches = [];

    for (const user of allUsers) {
      // 不匹配自己
      if (user.id === currentUser.id) continue;

      const score = this.calculateMatchScore(currentUser, user);

      // 计算所有用户的匹配度，不设最低分数限制
      matches.push({
        user: user,
        score: score,
        reasons: this.getMatchReasons(currentUser, user, score)
      });
    }

    // 按匹配度从高到低排序
    matches.sort((a, b) => b.score - a.score);

    // 返回所有匹配结果（前端会显示至少前3个）
    return matches;
  }

  // 生成匹配原因说明
  static getMatchReasons(user1, user2, score) {
    const reasons = [];

    const skillNeedScore = this.cosineSimilarity(user1.skills || '', user2.needs || '');
    if (skillNeedScore > 0.2) {
      reasons.push(`你的技能可以帮助解决对方的需求 (匹配度: ${(skillNeedScore * 100).toFixed(0)}%)`);
    }

    const interestScore = this.cosineSimilarity(user1.interests || '', user2.interests || '');
    if (interestScore > 0.2) {
      reasons.push(`你们有相似的兴趣爱好 (相似度: ${(interestScore * 100).toFixed(0)}%)`);
    }

    const lookingForMatch = this.cosineSimilarity(user1.looking_for || '', user2.skills || '');
    if (lookingForMatch > 0.2) {
      reasons.push(`对方具备你寻找的技能 (匹配度: ${(lookingForMatch * 100).toFixed(0)}%)`);
    }

    const needSkillScore = this.cosineSimilarity(user1.needs || '', user2.skills || '');
    if (needSkillScore > 0.2) {
      reasons.push(`对方可以帮助你解决需求 (匹配度: ${(needSkillScore * 100).toFixed(0)}%)`);
    }

    const majorScore = this.cosineSimilarity(user1.major || '', user2.major || '');
    if (majorScore > 0.3) {
      reasons.push('你们的专业背景相关');
    }

    // 如果没有任何匹配，根据总分给出提示
    if (reasons.length === 0) {
      if (score < 0.05) {
        reasons.push('目前匹配度较低，建议完善个人资料以获得更好的推荐');
      } else {
        reasons.push('基于综合评估可能有合作机会');
      }
    }

    return reasons;
  }

  // 为问题推荐合适的解决者
  static async findSolversForProblem(problem, allUsers, posterPoints) {
    const matches = [];

    for (const user of allUsers) {
      // 不推荐给发布者自己
      if (user.id === problem.user_id) continue;

      // 计算技能匹配度
      const skillMatch = this.cosineSimilarity(
        user.skills || '',
        problem.required_skills || problem.description || ''
      );

      // 高积分用户获得优先权（加成10%）
      let finalScore = skillMatch;
      if (posterPoints > 100) {
        finalScore *= 1.1;
      }

      if (finalScore > 0.1) {
        matches.push({
          user: user,
          score: finalScore,
          priority: posterPoints > 100 ? 'high' : 'normal'
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches;
  }
}

module.exports = MatchingEngine;
