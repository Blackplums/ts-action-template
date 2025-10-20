import { describe, it, expect, vi } from "vitest";
import { formatPrComment, run } from "./index";

// Minimal interfaces for test fakes
interface CreateCommentParams {
	issue_number: number;
	owner: string;
	repo: string;
	body: string;
}

interface FakeCore {
	getInput: (name: string) => string;
	setFailed: (msg: string) => void;
	setOutput: (name: string, value: unknown) => void;
}

interface FakeGithub {
	context: {
		payload: {
			pull_request?: {
				[key: string]: unknown;
				number: number;
				user: { login: string };
				title: string;
			};
		};
		repo: { owner: string; repo: string };
	};
	getOctokit: (token: string) => {
		rest: {
			issues: {
				createComment: (
					params: CreateCommentParams,
				) => Promise<{ data: { id: number } }>;
			};
		};
	};
}

describe("formatPrComment", () => {
	it("should format a PR comment with GitHub context", () => {
		const result = formatPrComment(123, "johndoe", "Fix login bug");

		expect(result).toContain("PR #123");
		expect(result).toContain("@johndoe");
		expect(result).toContain("Fix login bug");
		expect(result).toContain("GitHub Action Bot");
		expect(result).toContain("Ready for review");
	});

	it("should handle special characters in PR title", () => {
		const result = formatPrComment(
			456,
			"jane-smith",
			'feat: add "new feature" & improvements',
		);

		expect(result).toContain("PR #456");
		expect(result).toContain("@jane-smith");
		expect(result).toContain('feat: add "new feature" & improvements');
	});
});

describe("run", () => {
	it("should setFailed if not a pull request", async () => {
		const fakeCore: FakeCore = {
			getInput: () => "fake-token",
			setFailed: vi.fn(),
			setOutput: vi.fn(),
		};
		const fakeGithub: FakeGithub = {
			context: { payload: {}, repo: { owner: "owner", repo: "repo" } },
			getOctokit: vi.fn(),
		};
		await run(fakeCore, fakeGithub);
		expect(fakeCore.setFailed).toHaveBeenCalledWith(
			"This action only runs on pull requests",
		);
	});

	it("should create a formatted comment and set output if pull request exists", async () => {
		const fakeCore: FakeCore = {
			getInput: () => "fake-token",
			setFailed: vi.fn(),
			setOutput: vi.fn(),
		};
		const createCommentMock = vi.fn().mockResolvedValue({ data: { id: 123 } });
		const fakeGithub: FakeGithub = {
			context: {
				payload: {
					pull_request: {
						number: 42,
						user: { login: "testuser" },
						title: "Test PR Title",
					},
				},
				repo: { owner: "owner", repo: "repo" },
			},
			getOctokit: () => ({
				rest: { issues: { createComment: createCommentMock } },
			}),
		};
		await run(fakeCore, fakeGithub);

		expect(createCommentMock).toHaveBeenCalledWith({
			issue_number: 42,
			owner: "owner",
			repo: "repo",
			body: expect.stringContaining("PR #42"),
		});
		expect(createCommentMock).toHaveBeenCalledWith({
			issue_number: 42,
			owner: "owner",
			repo: "repo",
			body: expect.stringContaining("@testuser"),
		});
		expect(createCommentMock).toHaveBeenCalledWith({
			issue_number: 42,
			owner: "owner",
			repo: "repo",
			body: expect.stringContaining("Test PR Title"),
		});
		expect(fakeCore.setOutput).toHaveBeenCalledWith("comment-id", 123);
	});

	it("should setFailed with error message on exception", async () => {
		const fakeCore: FakeCore = {
			getInput: () => {
				throw new Error("fail");
			},
			setFailed: vi.fn(),
			setOutput: vi.fn(),
		};
		const fakeGithub: FakeGithub = {
			context: {
				payload: {
					pull_request: {
						number: 42,
						user: { login: "testuser" },
						title: "Test PR",
					},
				},
				repo: { owner: "owner", repo: "repo" },
			},
			getOctokit: () => ({ rest: { issues: { createComment: vi.fn() } } }),
		};
		const consoleErrorMock = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		await run(fakeCore, fakeGithub);
		expect(fakeCore.setFailed).toHaveBeenCalledWith("fail");
		consoleErrorMock.mockRestore();
	});

	it("should setFailed with string error message when non-Error is thrown", async () => {
		const fakeCore: FakeCore = {
			getInput: () => {
				throw "fail-string";
			},
			setFailed: vi.fn(),
			setOutput: vi.fn(),
		};
		const fakeGithub: FakeGithub = {
			context: {
				payload: {
					pull_request: {
						number: 42,
						user: { login: "testuser" },
						title: "Test PR",
					},
				},
				repo: { owner: "owner", repo: "repo" },
			},
			getOctokit: () => ({ rest: { issues: { createComment: vi.fn() } } }),
		};
		const consoleErrorMock = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		await run(fakeCore, fakeGithub);
		expect(fakeCore.setFailed).toHaveBeenCalledWith("fail-string");
		expect(consoleErrorMock).toHaveBeenCalledWith("fail-string");
		consoleErrorMock.mockRestore();
	});

	it("should fail when github-token is not provided", async () => {
		const fakeCore: FakeCore = {
			getInput: () => "", // empty token
			setFailed: vi.fn(),
			setOutput: vi.fn(),
		};
		const fakeGithub: FakeGithub = {
			context: {
				payload: {
					pull_request: {
						number: 42,
						user: { login: "testuser" },
						title: "Test PR",
					},
				},
				repo: { owner: "owner", repo: "repo" },
			},
			getOctokit: () => ({
				rest: {
					issues: {
						createComment: vi.fn().mockResolvedValue({ data: { id: 0 } }),
					},
				},
			}),
		};
		await run(fakeCore, fakeGithub);
		expect(fakeCore.setFailed).not.toHaveBeenCalledWith(
			"This action only runs on pull requests",
		);
	});
});
