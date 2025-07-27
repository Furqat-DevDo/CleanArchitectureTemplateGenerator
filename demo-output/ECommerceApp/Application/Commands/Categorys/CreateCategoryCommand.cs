using MediatR;
using ECommerceApp.Application.Interfaces;
using ECommerceApp.Domain.Entities;

namespace ECommerceApp.Application.Commands.Categorys
{
    public class CreateCategoryCommand : IRequest<Unit>
    {
        // Simplified command - no property loops for now
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Unit>
    {
        private readonly ICategoryRepository _repository;

        public CreateCategoryCommandHandler(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            // Simplified implementation
            throw new NotImplementedException();
        }
    }
}