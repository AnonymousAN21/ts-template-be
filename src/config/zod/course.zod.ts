import z, { string } from "zod";

export const CourseSchema = z.object({
    param: {
        id: z.string().optional()
    },
    body:{
        title: z.string().optional(),
        description: z.string().optional(),
        collabolators: z.array(z.string()).optional(),
        allowed_role: z.array(z.string()).optional()
    },
    query:{
        code: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        author: z.string().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),

        page: z.number().default(1),
        limit: z.number().default(5)
    }
})

export const createCourseSchema = z.object({
    body:{
        title: z.string(),
        description: z.string(),
        collabolators: z.array(z.string()).optional(),
        allowed_role: z.array(z.string()).optional()
    }
})
