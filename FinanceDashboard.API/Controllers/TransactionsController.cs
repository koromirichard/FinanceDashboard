using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using FinanceDashboard.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Security.Claims;

namespace FinanceDashboard.API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactions()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            int userId = int.Parse(userIdString);
            var transactions = await _transactionService.GetTransactionsAsync(userId);

            return Ok(transactions);
        }

        [HttpGet("account/{accountId}")]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactionsByAccount(int accountId)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            var transactions = await _transactionService.GetTransactionsByAccountIdAsync(accountId);

            return Ok(transactions);
        }


        [HttpPost]
        public async Task<ActionResult<TransactionResponseDto>> CreateTransaction(CreateTransactionDto dto)
        {
            var result = await _transactionService.CreateTransactionAsync(dto);

            if (result == null) 
            {
                return NotFound("A megadott számla nem található.");
            }

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, UpdateTransactionDto dto)
        {
            var success = await _transactionService.UpdateTransactionAsync(id, dto);

            if (!success)
            {
                return NotFound("A tranzakció nem található.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Érvénytelen token.");

            try
            {
                int userId = int.Parse(userIdString);
                await _transactionService.DeleteTransactionAsync(id, userId);

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer(TransferDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Érvénytelen vagy hiányzó token.");
            }

            try
            {
                int userId = int.Parse(userIdString);
                await _transactionService.TransferTransactionAsync(userId, dto);

                return Ok(new { message = "Átutalás sikeresen végrehajtva." });
            }
            catch (Exception ex)
            {
                // Ha valamiért nem sikerül (pl. nincs elég fedezet, vagy rossz számla), itt dobjuk vissza a hibát
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}