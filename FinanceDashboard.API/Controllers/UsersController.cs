using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using FinanceDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceDashboard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _userService.GetUsersAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser(CreateUserDto dto)
        {
            var result = await _userService.CreateUserAsync(dto);

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var success = await _userService.UpdateUserAsync(id, dto);

            if (!success)
            {
                return NotFound("A felhasználó nem található.");
            }

            return NoContent();
        }

        [HttpPut("{id}/password")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto dto)
        {
            var result = await _userService.ChangePasswordAsync(id,dto);
            if (!result.IsSuccess)
            {
                return BadRequest(result.ErrorMessage);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var success = await _userService.DeleteUserAsync(id);

            if (!success)
            {
                return NotFound("A felhasználó nem található.");
            }
            return NoContent();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var token = await _userService.LoginAsync(dto);
            
            if (token == null)
            {
                return Unauthorized("Hibás e-mail cím vagy jelszó.");
            }
            
            return Ok(new { Token = token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(CreateUserDto dto)
        {
            try
            {
                var createdUser = await _userService.CreateUserAsync(dto);
                return Ok(createdUser);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
