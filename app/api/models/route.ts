export const maxDuration = 30;
export const runtime = "edge";

interface ModelListResponse {
    id: string;
}

export async function POST(req: Request) {
    try {
        const { modelConfig } = await req.json();
        const baseUrl: string =
            (modelConfig?.baseUrl?.trim() as string | undefined) ||
            process.env.OPENAI_BASE_URL ||
            "https://api.openai.com/v1";
        const apiKey: string | undefined =
            (modelConfig?.apiKey?.trim() as string | undefined) ||
            process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return Response.json(
                { error: "缺少 API Key，无法获取模型列表" },
                { status: 400 }
            );
        }

        const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/models`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            return Response.json(
                { error: `获取模型失败：${res.status} ${text.slice(0, 300)}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        const ids =
            (data?.data as ModelListResponse[] | undefined)?.map((m) => m.id) ||
            [];

        return Response.json({ models: ids });
    } catch (error) {
        console.error("models route error", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
