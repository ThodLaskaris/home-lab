package services

import (
	"os"
	"strings"

	"github.com/vmihailenco/msgpack/v5"
)

func LoadCatalogBatch(rawItems []RawProduct) {
	RegistryMutex.Lock()
	defer RegistryMutex.Unlock()

	dfMutex.Lock()
	defer dfMutex.Unlock()

	if Catalog == nil {
		Catalog = make(map[string][]Product)
	}

	for _, item := range rawItems {
		if item.Name == "" {
			continue
		}

		quantity, unit, _ := ParseNormalize(item.Name)
		fullNormalized := normalize(item.Name)
		allTokens := cleanNameTokens(strings.Fields(fullNormalized))
		cleanTokens := cleanNameTokens(allTokens)
		cleanNormalizedName := strings.Join(cleanTokens, " ")

		product := Product{
			Name:           item.Name,
			NormalizedName: cleanNormalizedName,
			Tokens:         cleanTokens,
			Price:          item.Price,
			Category:       item.Category,
			URL:            item.URL,
			Image:          item.Image,
			Quantity:       quantity,
			Unit:           unit,
		}
		Catalog[item.Category] = append(Catalog[item.Category], product)

		TotalProducts++
		uniqueTokens := make(map[string]bool)
		for _, token := range cleanTokens {
			uniqueTokens[token] = true
		}
		for token := range uniqueTokens {
			ItemFrequency[token]++
		}
	}
}

func SaveCatalog(filename string) error {
	RegistryMutex.RLock()
	defer RegistryMutex.RUnlock()

	data, err := msgpack.Marshal(Catalog)
	if err != nil {
		return err
	}

	return os.WriteFile(filename, data, 0644)
}

func RestoreCatalog(filename string) error {
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}
	RegistryMutex.Lock()
	defer RegistryMutex.Unlock()

	err = msgpack.Unmarshal(data, &Catalog)
	if err != nil {
		return err
	}

	dfMutex.Lock()
	defer dfMutex.Unlock()

	ItemFrequency = make(map[string]uint32)
	TotalProducts = uint32(0)

	for _, products := range Catalog {
		for _, product := range products {
			TotalProducts++
			uniqueTokens := make(map[string]bool)

			for _, token := range product.Tokens {
				uniqueTokens[token] = true
			}
			for token := range uniqueTokens {
				ItemFrequency[token]++
			}
		}
	}
	return nil
}
