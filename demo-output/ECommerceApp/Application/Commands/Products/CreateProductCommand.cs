using MediatR;
using ECommerceApp.Application.Interfaces;
using ECommerceApp.Domain.Entities;

namespace ECommerceApp.Application.Commands.Products
{
    public class CreateProductCommand : IRequest<Unit>
    {
        // Simplified command - no property loops for now
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Unit>
    {
        private readonly IProductRepository _repository;

        public CreateProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            // Simplified implementation
            throw new NotImplementedException();
        }
    }
}