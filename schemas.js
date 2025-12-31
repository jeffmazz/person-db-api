const { z } = require("zod");

const personSchema = z.object({
  name: z.string().min(3, "The name must have at least 3 characters"),
  email: z.string().email("Invalid email"),

  height: z.number().positive("Height must be higher than 0"),
  weight: z.number().positive("Weight must be higher than 0"),

  isWorking: z.boolean(),

  salary: z.number().positive().optional(),
});

module.exports = { personSchema };
