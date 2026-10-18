import { beforeEach, describe, expect, it, vi } from "vitest";

const { clientGet } = vi.hoisted(() => ({ clientGet: vi.fn() }));

vi.mock("../client.js", () => ({
  plankaClient: {
    get: clientGet,
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { getCommentsForCard } from "./comments.js";
import { getCard } from "./cards.js";

const comment = (id: string, createdAt: string) => ({
  id,
  cardId: "123",
  userId: "1",
  text: `comment ${id}`,
  createdAt,
});

describe("getCommentsForCard", () => {
  beforeEach(() => {
    clientGet.mockReset();
  });

  it("fetches comments from the dedicated card comments endpoint", async () => {
    clientGet.mockResolvedValueOnce({
      items: [comment("1", "2026-10-18T16:00:00.000Z")],
      included: { users: [] },
    });

    const comments = await getCommentsForCard("123");

    expect(clientGet).toHaveBeenCalledWith("/api/cards/123/comments");
    expect(comments.map((c) => c.id)).toEqual(["1"]);
  });

  it("returns the comments newest first", async () => {
    clientGet.mockResolvedValueOnce({
      items: [
        comment("1", "2026-10-18T16:00:00.000Z"),
        comment("2", "2026-10-18T17:00:00.000Z"),
      ],
      included: { users: [] },
    });

    const comments = await getCommentsForCard("123");

    expect(comments.map((c) => c.id)).toEqual(["2", "1"]);
  });
});

describe("getCard", () => {
  beforeEach(() => {
    clientGet.mockReset();
  });

  it("merges the comments endpoint into the card details", async () => {
    // PLANKA 2.x never includes comments in the card detail response:
    // whatever sits in `included` must not shadow the real ones.
    clientGet.mockImplementation(async (path: string) => {
      if (path === "/api/cards/123") {
        return {
          item: {
            id: "123",
            boardId: "1",
            listId: "2",
            name: "05. Intégration continue",
            position: 1,
            type: "project",
            createdAt: "2026-10-05T21:20:01.982Z",
            commentsTotal: 1,
          },
          included: { comments: [] },
        };
      }
      if (path === "/api/cards/123/comments") {
        return {
          items: [comment("9", "2026-10-18T16:51:33.599Z")],
          included: { users: [] },
        };
      }
      throw new Error(`unexpected GET ${path}`);
    });

    const details = await getCard("123");

    expect(clientGet).toHaveBeenCalledWith("/api/cards/123/comments");
    expect(details.comments.map((c) => c.id)).toEqual(["9"]);
  });
});
