package main

import (
	"io"
	"log"
	"net"

	"google.golang.org/grpc"
	pb "web-scrapper/proto" 
)

type server struct {
	pb.UnimplementedDataProcessorServer
}

func (s *server) StreamProducts(stream pb.DataProcessor_StreamProductsServer) error {
	var count int32
	log.Println("Stream started from Node.js...")

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			log.Printf("Stream finished. Total items processed: %d", count)
			return stream.SendAndClose(&pb.SummaryResponse{
				Message: "Master Data Synced Successfully",
				Count:   count,
				Success: true,
			})
		}
		if err != nil {
			log.Printf("Stream error: %v", err)
			return err
		}
		// Fuzzy match v001
		log.Printf("Received: %s | Price: %.2f", req.GetName(), req.GetPrice())
		count++
	}
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterDataProcessorServer(s, &server{})

	log.Println("gRPC Server is running on..")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}