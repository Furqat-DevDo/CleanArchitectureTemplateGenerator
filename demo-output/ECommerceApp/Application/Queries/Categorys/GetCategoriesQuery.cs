using MediatR;
using ECommerceApp.Application.DTOs;
using ECommerceApp.Application.Interfaces;

namespace ECommerceApp.Application.Queries.Categorys
{
    public class GetCategoriesQuery : IRequest<List<CategoryDto>>
    {
        // Simplified query - no conditional properties for now
        public Guid Id { get; set; }
    }

    public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
    {
        private readonly ICategoryRepository _repository;

        public GetCategoriesQueryHandler(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            // Simplified implementation
            throw new NotImplementedException();
        }
    }
}