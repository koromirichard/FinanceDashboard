using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using FinanceDashboard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceDashboard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountResponseDto>>> GetAccounts()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            int userId = int.Parse(userIdString);
            var accounts = await _accountService.GetAccountsAsync(userId);

            return Ok(accounts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountResponseDto>> GetAccount(int id)
        {
            var account = await _accountService.GetAccountAsync(id);
            if (account == null)
            {
                return NotFound("A megadott számla nem található.");
            }

            return Ok(account);
        }

        [HttpPost]
        public async Task<ActionResult<AccountResponseDto>> CreateAccount(CreateAccountDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            dto.UserId = int.Parse(userIdString);

            var createdAccount = await _accountService.CreateAccountAsync(dto);

            return Ok(createdAccount);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAccount(int id, UpdateAccountDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            int userId = int.Parse(userIdString);
            var success = await _accountService.UpdateAccountAsync(id, dto, userId);

            if (!success)
            {
                return NotFound("A megadott számla nem található, vagy nincs hozzá jogosultságod.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            int userId = int.Parse(userIdString);
            var success = await _accountService.DeleteAccountAsync(id, userId);

            if (!success)
            {
                return NotFound("A megadott számla nem található, vagy nincs hozzá jogosultságod.");
            }

            return NoContent();
        }
    }
}
