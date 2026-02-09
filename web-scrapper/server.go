package main

import (
	"io"
	"log"
	"net"
	"os"

	pb "web-scrapper/proto"

	"github.com/vmihailenco/msgpack/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	port     = ":50051"
	fileName = "scrapeMeDaddy.msgpack"
	initialCap = 7500 
)

type Product struct {
	Name  string  `msgpack:"name"`
	Price float32 `msgpack:"price"`
	Image string  `msgpack:"image"`
}

type dataServer struct {
	pb.UnimplementedDataProcessorServer
}

func (s *dataServer) StreamProducts(stream pb.DataProcessor_StreamProductsServer) error {
	products := make([]Product, 0, initialCap)

	for {
		req, err := stream.Recv()
		if err == io.EOF {
		success := false
		if len(products) > 0 {
			b, _ := msgpack.Marshal(products)
			if err := os.WriteFile(fileName, b, 0644); err == nil {
			success = true
        }
		return stream.SendAndClose(&pb.SummaryResponse{Success: success})
    }
    return stream.SendAndClose(&pb.SummaryResponse{Success: success})
 }
		if err != nil {
			return status.Error(codes.Aborted, "stream_error")
		}

		products = append(products, Product{
			Name:  req.Name,
			Price: req.Price,
			Image: req.Image,
		})
	}
}


func main() {
	lis, _ := net.Listen("tcp", port)
	s := grpc.NewServer()
	pb.RegisterDataProcessorServer(s, &dataServer{})
	
	log.Println("Server is running..")
	_ = s.Serve(lis)
}