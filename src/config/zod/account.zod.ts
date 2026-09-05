import z from "zod";

export const registerSchema = z.object({
    body: z.object({
        first_name: z.string().min(3, "First name must atleast 3 characters"),
        last_name: z.string().min(3, "Last name must atleast 3 characters"),
        username: z.string().min(3, "Username must atleast 3 characters"),
        password: z.string().min(8, "Password must atleast 8 characters"),
        email: z.email('Invalid email address'),
        about_me: z.string().optional()
    })
})

export const loginSchema = z.object({
    body: z.object({
        username: z.string().min(3, "Username must atleast 3 characters").optional(),
        email: z.email("Invalid email address").optional(),
        password: z.string().min(8, "Password must atleast 3 characters")
    })
})
