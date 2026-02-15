package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	pb "github.com/ThodLaskaris/go-engine/proto"
	"github.com/ThodLaskaris/go-engine/services"
)

func main() {
	err := services.RestoreCatalog("../data/catalog.bin")
	if err != nil {
		log.Printf("ℹCatalog file not found in data/: %v", err)
	} else {
		log.Println("Catalog ok")
	}

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()

	pb.RegisterDataProcessorServer(s, &services.DataProcessorServer{})

	log.Printf("Go-Engine gRPC Server is running on :50051")

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
