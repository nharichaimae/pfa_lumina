using System.IdentityModel.Tokens.Jwt;

namespace pfa__.net.Helpers
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                var token = authorizationHeader.Substring("Bearer ".Length).Trim();
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var claim = jwtToken.Claims.FirstOrDefault(c => c.Type == "id");

                if (claim != null)
                {
                    context.Items["UserId"] = int.Parse(claim.Value);
                }
            }

            await _next(context);
        }
    }
}
