using MediatR;
using ECommerceApp.Application.Interfaces;
using ECommerceApp.Domain.Entities;

namespace ECommerceApp.Application.Commands.Products
{
    public class DeleteProductCommand : IRequest<Unit>
    {
        // Simplified command - no property loops for now
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Unit>
    {
        private readonly IProductRepository _repository;

        public DeleteProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            // Simplified implementation
            throw new NotImplementedException();
        }
    }
}