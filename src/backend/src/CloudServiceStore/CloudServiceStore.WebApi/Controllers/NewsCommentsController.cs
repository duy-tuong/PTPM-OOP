using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Content.NewsComments;
using CloudServiceStore.Application.Features.Content.NewsComments.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Công khai, KHÔNG [Authorize] - đúng tiền lệ ConsultationRequestsController (dự án chưa có
// captcha/rate-limit, chấp nhận rủi ro thấp cho quy mô BTL). app.UseAuthentication() chạy toàn cục nên
// User.Identity vẫn được điền nếu client gửi kèm Bearer token hợp lệ dù action không gắn [Authorize] -
// dùng để nhận diện khách đã đăng nhập mà không bắt buộc phải đăng nhập mới bình luận được.
[ApiController]
[Route("api/news-comments")]
public class NewsCommentsController : ControllerBase
{
    private readonly INewsCommentService _service;

    public NewsCommentsController(INewsCommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<NewsCommentDto>>> GetForArticle([FromQuery] int newsArticleId, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetForArticleAsync(newsArticleId, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<NewsCommentDto>> Create(CreateNewsCommentDto dto, CancellationToken cancellationToken)
    {
        Guid? customerId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(sub, out var parsed))
            {
                customerId = parsed;
            }
        }

        var result = await _service.CreateAsync(dto, customerId, cancellationToken);
        return CreatedAtAction(nameof(GetForArticle), new { newsArticleId = dto.NewsArticleId }, result);
    }
}
