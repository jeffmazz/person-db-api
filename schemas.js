const { z } = require("zod");

const personSchema = z.object({
  name: z.string().trim().min(3, "The name must have at least 3 characters"),
  email: z.string().trim().email("Invalid email"),

  height: z.coerce.number().positive("Height must be higher than 0"),
  weight: z.coerce.number().positive("Weight must be higher than 0"),

  isWorking: z.boolean(),

  salary: z.coerce.number().positive().optional(),
});

const updatePersonSchema = personSchema.partial();

module.exports = { personSchema, updatePersonSchema };
