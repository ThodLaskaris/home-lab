package services

import (
	"context"
	"io"
	"log"

	pb "github.com/ThodLaskaris/go-engine/proto"
)

type DataProcessorServer struct {
	pb.UnimplementedDataProcessorServer
}

func (s *DataProcessorServer) StreamProducts(stream pb.DataProcessor_StreamProductsServer) error {
	var batch []RawProduct
	count := 0

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			if len(batch) > 0 {
				LoadCatalogBatch(batch)
			}
			saveErr := SaveCatalog("../data/catalog.bin")
			if saveErr != nil {
				log.Printf("Error  %v", saveErr)
			} else {
			}

			return stream.SendAndClose(&pb.SummaryResponse{
				Message: "Complete",
				Count:   int32(count),
				Success: true,
			})
		}
		if err != nil {
			log.Printf("Stream error: %v", err)
			return err
		}

		batch = append(batch, RawProduct{
			Name:     req.GetName(),
			Price:    req.GetPrice(),
			Category: req.GetCategory(),
			Image:    req.GetImage(),
			URL:      req.GetUrl(),
		})

		count++
		if len(batch) >= 500 {
			LoadCatalogBatch(batch)
			batch = []RawProduct{}
		}
	}
}

func (s *DataProcessorServer) MatchReceiptItem(ctx context.Context, req *pb.MatchRequest) (*pb.MatchResponse, error) {
	result, err := GetCategory(req.GetSourceCategory(), req.GetRawText())
	if err != nil {
		return &pb.MatchResponse{
			Category:    "None",
			Score:       0.0,
			MatchedWith: "None",
		}, nil
	}

	return &pb.MatchResponse{
		Category:    result.Category,
		Score:       result.Score,
		MatchedWith: result.MatchedWith,
	}, nil
}
