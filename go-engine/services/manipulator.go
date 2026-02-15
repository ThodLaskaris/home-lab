package services

import (
	"strconv"
	"strings"
	"sync"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

var (
	latinizer *strings.Replacer
	once      sync.Once
)

func normalize(input string) string {
	trimmed := strings.TrimSpace(input)
	step1, _ := removeAccent(trimmed)
	step2 := toUpper(step1)
	return greekToLatin(step2)
}

func toUpper(input string) string {
	return strings.ToUpper(input)
}

func removeAccent(input string) (string, error) {
	if input == "" {
		return "", nil
	}

	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	normalized, _, err := transform.String(t, input)
	if err != nil {
		return "", err
	}
	return normalized, nil
}

func splitToken(token string) (string, string, bool) {
	var numPart strings.Builder
	var unitPart strings.Builder
	hasDigit := false

	for _, tok := range token {
		if unicode.IsDigit(tok) || tok == '.' || tok == ',' {
			numPart.WriteRune(tok)
			hasDigit = true
		} else {
			unitPart.WriteRune(tok)
		}
	}
	return numPart.String(), unitPart.String(), hasDigit
}

func parseNumeric(numStr string) (float64, bool) {
	cleanStr := strings.ReplaceAll(numStr, ",", ".")

	value, err := strconv.ParseFloat(cleanStr, 64)
	if err != nil {
		return 0, false
	}
	return value, true
}

func extractValueUnit(token string) (float64, string, bool) {
	numStr, unitStr, hasDigit := splitToken(token)

	if !hasDigit {
		return 0, "", false
	}
	value, ok := parseNumeric(numStr)
	if !ok {
		return 0, "", false
	}
	return value, unitStr, true
}

func findUnit(value float64, rawUnit string) (float64, string, error) {
	unitArray := []rune(rawUnit)
	length := len(unitArray)

	if length != 2 {
		return 0, "", nil
	}
	if unitArray[1] == 'G' || unitArray[1] == 'L' {
		unitArray[0], unitArray[1] = unitArray[1], unitArray[0]
	}

	if unitArray[0] != 'G' && unitArray[0] != 'L' {
		return 0, "", nil
	}

	if unitArray[1] == 'K' {
		value = convertKgToGr(value)
		unitArray[1] = 'R'
	}
	if unitArray[1] == 'M' {
		value = convertMlToLt(value)
		unitArray[1] = 'T'
	}
	return value, string(unitArray), nil
}

func convertKgToGr(value float64) float64 {
	return value * 1000.0
}
func convertMlToLt(value float64) float64 {
	return value / 1000.0
}
func ParseNormalize(name string) (float64, string, error) {
	words := strings.Fields(name)
	if len(words) == 0 {
		return 0, "", nil
	}
	token := words[len(words)-1]
	value, rawUnit, ok := extractValueUnit(token)

	if !ok {
		return 0, "", nil
	}
	cleanUnit := normalize(rawUnit)
	return findUnit(value, cleanUnit)
}

func greekToLatin(input string) string {
	if input == "" {
		return ""
	}

	once.Do(func() {
		latinizer = strings.NewReplacer(
			"Γ", "G", "Δ", "D", "Θ", "TH", "Λ", "L", "Ξ", "X",
			"Π", "P", "Ρ", "R", "Φ", "F", "Ψ", "PS", "Ω", "O",
			"Α", "A", "Β", "B", "Ε", "E", "Ζ", "Z", "Η", "H", "Ι", "I",
			"Κ", "K", "Μ", "M", "Ν", "N", "Ο", "O", "Σ", "S", "Τ", "T",
			"Υ", "Y", "Χ", "X",
		)
	})
	return latinizer.Replace(input)
}
