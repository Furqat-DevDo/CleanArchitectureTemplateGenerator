using MediatR;
using Microsoft.AspNetCore.Mvc;
using ECommerceApp.Application.Commands.Products;
using ECommerceApp.Application.Queries.Products;

namespace ECommerceApp.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Simplified controller - no loops for now
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Simplified implementation
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            // Simplified implementation
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> Create()
        {
            // Simplified implementation
            return Ok();
        }
    }
}