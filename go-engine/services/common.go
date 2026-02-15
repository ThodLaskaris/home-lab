package services

import "sync"

type RawProduct struct {
	Name     string  `json:"n"`
	Price    float64 `json:"p"`
	Image    string  `json:"i"`
	Category string  `json:"c"`
	URL      string  `json:"u"`
}

type Product struct {
	Name           string   `msgpack:"n"`
	NormalizedName string   `msgpack:"nn"`
	Tokens         []string `msgpack:"t"`
	Price          float64  `msgpack:"p"`
	Category       string   `msgpack:"c"`
	URL            string   `msgpack:"u"`
	Image          string   `msgpack:"i"`
	Quantity       float64  `msgpack:"q"`
	Unit           string   `msgpack:"u"`
}

var (
	Catalog       = make(map[string][]Product)
	RegistryMutex sync.RWMutex

	ItemFrequency = make(map[string]uint32)
	TotalProducts = uint32(0)
	dfMutex       sync.RWMutex
)
