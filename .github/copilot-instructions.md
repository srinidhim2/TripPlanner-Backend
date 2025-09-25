# Copilot Instructions for Trip Service Project

This repository is for a **Trip Service** application.

## API Error Handling

- **Always use `http-errors` (or `HttpError`) for throwing errors inside API controllers.**
  - Set the appropriate HTTP status code (e.g., 400, 401, 404, 500) when throwing errors.
  - Example:
    ```js
    const createError = require('http-errors');
    throw createError(404, 'Trip not found');
    ```

## Logging

- **Use proper logger statements throughout the code:**
  - Use `logger.info` for high-level flow and successful operations.
  - Use `logger.debug` for detailed flow logs and debugging information.
  - Use `logger.error` for error conditions and exceptions.
- **Log the flow of each API call in the console for traceability.**

## General

- This project is being developed for a **trip service** platform.
- Maintain clean, readable, and well-documented code.
- Follow best practices for error handling and logging in all controllers and services.

```// filepath: /home/srinidhi/Code/TripPlanner/TP-backend/.github/copilot-instruction.md

# Copilot Instructions for Trip Service Project

This repository is for a **Trip Service** application.

## API Error Handling

- **Always use `http-errors` (or `HttpError`) for throwing errors inside API controllers.**
  - Set the appropriate HTTP status code (e.g., 400, 401, 404, 500) when throwing errors.
  - Example:
    ```js
    const createError = require('http-errors');
    throw createError(404, 'Trip not found');
    ```

## Logging

- **Use proper logger statements throughout the code:**
  - Use `logger.info` for high-level flow and successful operations.
  - Use `logger.debug` for detailed flow logs and debugging information.
  - Use `logger.error` for error conditions and exceptions.
- **Log the flow of each API call in the console for traceability.**

## General

- This project is being developed for a **trip service** platform.
- Maintain clean, readable, and well-documented code.
- Follow best practices for error handling and logging in all controllers and services.
