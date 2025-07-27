using MediatR;
using ECommerceApp.Application.Interfaces;
using ECommerceApp.Domain.Entities;

namespace ECommerceApp.Application.Commands.Products
{
    public class UpdateProductCommand : IRequest<Unit>
    {
        // Simplified command - no property loops for now
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Unit>
    {
        private readonly IProductRepository _repository;

        public UpdateProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            // Simplified implementation
            throw new NotImplementedException();
        }
    }
}