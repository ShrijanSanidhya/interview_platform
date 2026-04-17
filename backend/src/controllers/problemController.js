import Problem from "../models/Problem.js";
import { SEED_PROBLEMS } from "../data/seedProblems.js";

export const createProblem = async (req, res) => {
    try {
        const { title, difficulty, category, description, examples, constraints, starterCode, expectedOutput, topics } = req.body;

        const existingProblem = await Problem.findOne({ title });
        if (existingProblem) {
            return res.status(400).json({ message: "Problem with this title already exists" });
        }

        const problem = await Problem.create({
            title,
            difficulty,
            category,
            description,
            examples,
            constraints,
            starterCode,
            expectedOutput,
            topics,
            createdBy: req.user._id,
        });

        res.status(201).json({ problem });
    } catch (error) {
        console.error("Error in createProblem:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ isActive: true }).select("-expectedOutput"); // Hide expected output from list
        res.status(200).json({ problems });
    } catch (error) {
        console.error("Error in getAllProblems:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ problem });
    } catch (error) {
        console.error("Error in getProblemById:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const problem = await Problem.findByIdAndUpdate(id, updates, { new: true });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ problem });
    } catch (error) {
        console.error("Error in updateProblem:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProblem:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const seedProblems = async (req, res) => {
    try {
        const problems = SEED_PROBLEMS;

        let createdCount = 0;
        for (const p of problems) {
            const existing = await Problem.findOne({ title: p.title });
            if (!existing) {
                await Problem.create({
                    title: p.title,
                    difficulty: p.difficulty,
                    category: p.category,
                    description: p.description,
                    examples: p.examples,
                    constraints: p.constraints,
                    starterCode: p.starterCode,
                    expectedOutput: p.expectedOutput,
                    topics: p.topics,
                    createdBy: req.user._id, // Assign to the admin running the seed
                });
                createdCount++;
            }
        }

        res.status(200).json({ message: `Seeded ${createdCount} problems successfully` });
    } catch (error) {
        console.error("Error in seedProblems:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

import { ORIGINAL_PROBLEMS } from "../data/originalProblems.js";

export const generateProblem = async (req, res) => {
    try {
        // In a real AI system, this would call an LLM API.
        // For now, we simulate AI generation by randomly picking from our Curated Original Problems pool
        // that are NOT yet in the database.

        const allProblems = ORIGINAL_PROBLEMS;

        // Find a problem that doesn't exist in DB (by title)
        // We'll try up to 5 times to find a unique one to avoid expensive scans if DB is empty
        // Or better: get all titles from DB first? No, that's expensive for large DB.

        // Better strategy: Shuffle the original problems and try to insert the first valid one found.
        const shuffled = [...allProblems].sort(() => 0.5 - Math.random());

        let selectedProblem = null;

        for (const p of shuffled) {
            const exists = await Problem.exists({ title: p.title });
            if (!exists) {
                selectedProblem = p;
                break;
            }
        }

        if (!selectedProblem) {
            return res.status(404).json({ message: "All available unique problems have already been generated!" });
        }

        // Create the problem in DB
        const problem = await Problem.create({
            title: selectedProblem.title,
            difficulty: selectedProblem.difficulty,
            category: selectedProblem.category,
            description: selectedProblem.description,
            examples: selectedProblem.examples,
            constraints: selectedProblem.constraints,
            starterCode: selectedProblem.starterCode,
            expectedOutput: selectedProblem.expectedOutput,
            topics: selectedProblem.topics,
            createdBy: req.user._id,
        });

        res.status(201).json({ problem, message: "AI generated a new problem!" });

    } catch (error) {
        console.error("Error in generateProblem:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
