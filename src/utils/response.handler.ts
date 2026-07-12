import { Response } from "express";

/**
 * Metadata configuration for calculating offset-based pagination fields.
 */
export interface PaginationMetadata {
    /** The current active page number (1-indexed). */
    page: number;
    /** The maximum number of items per page. */
    limit: number;
    /** The total count of items matching the query across the entire dataset. */
    totalItems: number;
}

/**
 * A utility wrapper for standardizing API responses across an Express application.
 */
export default class ApiResponse {
    private res: Response;

    /**
     * Creates an instance of ApiResponse.
     * @param {Response} res - The native Express response object.
     */
    constructor(res: Response) {
        this.res = res;
    }

    /**
     * Sends a standard successful JSON response.
     * * @param {unknown} data - The payload to be returned to the client.
     * @param {string} [message="Success"] - A descriptive message indicating the outcome.
     * @param {number} [statusCode=200] - The HTTP status code (defaults to 200 OK).
     * @returns {Response} The Express response object.
     * * @example
     * return new ApiResponse(res).success({ id: 1, name: "Alice" }, "User fetched successfully");
     */
    public success<T>(data: T, message: string = "Success", statusCode = 200): Response {
        return this.res.status(statusCode).json({
            success: true,
            message: message,
            data: data 
        });
    }

    /**
     * Sends a successful JSON response containing array data formatted with pagination metadata.
     * * @param {unknown[]} data - The slice of dataset records matching the current page limit.
     * @param {PaginationMetadata} meta - The page, limit, and total count constraints.
     * @param {string} [message="Success"] - A descriptive message indicating the outcome.
     * @param {number} [statusCode=200] - The HTTP status code (defaults to 200 OK).
     * @returns {Response} The Express response object.
     * * @example
     * return new ApiResponse(res).successPagination(
     * usersArray, 
     * { page: 1, limit: 10, totalItems: 100 }, 
     * "Users fetched successfully"
     * );
     */
    public successPagination<T>(
        data: T[], 
        meta: PaginationMetadata, 
        message: string = "Success", 
        statusCode = 200
    ): Response {
        const totalPages = Math.ceil(meta.totalItems / meta.limit);

        return this.res.status(statusCode).json({
            success: true,
            message,
            data,
            pagination: {
                current_page: meta.page,
                limit: meta.limit,
                total_item: meta.totalItems,
                total_pages: totalPages,
                has_next_page: meta.page < totalPages,
                has_prev_page: meta.page > 1
            }
        });
    }

    /**
     * Sends a standard error JSON response.
     * * @param {string} [message="An error occurred"] - A user-friendly message describing the error state.
     * @param {number} [statusCode=500] - The HTTP status code representing the error (defaults to 500 Internal Server Error).
     * @param {unknown} [details=null] - Optional raw error structures, validation messages, or stacks.
     * @returns {Response} The Express response object.
     * * @example
     * return new ApiResponse(res).error("Resource not found", 404);
     */
    public error(message: string = "An error occurred", statusCode = 500, details: unknown = null): Response {
        return this.res.status(statusCode).json({
            success: false,
            message: message,
            error: details
        });
    }
}