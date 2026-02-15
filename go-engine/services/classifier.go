package services

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"unicode"

	"github.com/agnivade/levenshtein"
)

type MatchResult struct {
	Category    string
	Score       float64
	MatchedWith string
}

func GetCategory(sourceCategory string, rawName string) (*MatchResult, error) {
	if sourceCategory != "" {
		return &MatchResult{
			Category:    sourceCategory,
			Score:       1.0,
			MatchedWith: "SourceOfTruth"}, nil
	}
	result := findBestMatch(rawName)

	if result.Score < 0.05 {
		return result, fmt.Errorf("low confidence match score %.2f", result.Score)
	}
	return result, nil
}

func findBestMatch(rawName string) *MatchResult {
	bestMatch := &MatchResult{
		Category:    "none",
		Score:       0.0,
		MatchedWith: "none"}

	if rawName == "" {
		return bestMatch
	}

	cleanText := normalize(rawName)
	receiptTokens := strings.Fields(cleanText)

	RegistryMutex.RLock()
	defer RegistryMutex.RUnlock()

	for category, products := range Catalog {
		for _, product := range products {
			score := calculateSimilarity(receiptTokens, product.Tokens)
			if score > bestMatch.Score {
				bestMatch.Category = category
				bestMatch.Score = score
				bestMatch.MatchedWith = product.Name
			}
		}
	}
	return bestMatch
}

func calculateSimilarity(receiptTokens []string, catalogTokens []string) float64 {
	if len(receiptTokens) == 0 || len(catalogTokens) == 0 {
		return 0.0
	}

	totalScore := 0.0
	maxPossibleScore := 0.0
	exactMatches := 0

	for i, rTok := range receiptTokens {
		df := ItemFrequency[rTok]
		idf := math.Log(float64(TotalProducts + 1))
		if df > 0 {
			idf = math.Log(float64(TotalProducts+1) / float64(df))
		}

		isExtra := false
		if _, err := strconv.ParseFloat(rTok, 64); err == nil || len(rTok) <= 2 {
			isExtra = true
			idf *= 0.2
		}

		maxPossibleScore += idf
		bestTokMatch := 0.0

		for j, cTok := range catalogTokens {
			dist := levenshtein.ComputeDistance(rTok, cTok)
			similarity := 0.0

			if dist == 0 {
				similarity = 1.0
				if !isExtra {
					exactMatches++
				}
			} else if !isExtra && dist <= 2 && len(rTok) >= 5 {
				similarity = 0.6
			} else if !isExtra && strings.Contains(cTok, rTok) && len(rTok) >= 5 {
				similarity = 0.5
			}

			if i == j && i == 0 {
				similarity *= 1.1
			}
			if similarity > bestTokMatch {
				bestTokMatch = similarity
			}
		}
		totalScore += bestTokMatch * idf
	}

	if maxPossibleScore == 0 {
		return 0.0
	}
	if exactMatches == 0 && len(receiptTokens) > 1 {
		return 0.0
	}

	baseScore := totalScore / maxPossibleScore
	missingPenalty := (1.0 - (float64(exactMatches) / float64(len(receiptTokens)))) * 0.2

	diff := math.Abs(float64(len(catalogTokens) - len(receiptTokens)))
	lenPenalty := 1.0 / (1.0 + (0.05 * diff))

	finalScore := (baseScore - missingPenalty) * lenPenalty
	if finalScore > 1.0 {
		finalScore = 1.0
	}
	if finalScore < 0 {
		finalScore = 0
	}

	return finalScore
}
func cleanNameTokens(tokens []string) []string {
	if len(tokens) <= 1 {
		return tokens
	}
	lastIndex := len(tokens) - 1
	lastToken := tokens[lastIndex]

	hasDigit := false
	for _, token := range lastToken {
		if unicode.IsDigit(token) {
			hasDigit = true
			break
		}
	}

	if hasDigit {
		return tokens[:lastIndex]
	}
	return tokens
}
