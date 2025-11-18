export default function ExamplePanel({
    setInput,
    setFiles,
}: {
    setInput: (input: string) => void;
    setFiles: (files: File[]) => void;
}) {
    // New handler for the "Replicate this flowchart" button
    const handleReplicateFlowchart = async () => {
        setInput("复制此流程图");

        try {
            // Fetch the example image
            const response = await fetch("/example.png");
            const blob = await response.blob();
            const file = new File([blob], "example.png", { type: "image/png" });

            // Set the file to the files state
            setFiles([file]);
        } catch (error) {
            console.error("Error loading example image:", error);
        }
    };

    // Handler for the "Replicate this in aws style" button
    const handleReplicateArchitecture = async () => {
        setInput("以AWS风格复制此图");

        try {
            // Fetch the architecture image
            const response = await fetch("/architecture.png");
            const blob = await response.blob();
            const file = new File([blob], "architecture.png", {
                type: "image/png",
            });

            // Set the file to the files state
            setFiles([file]);
        } catch (error) {
            console.error("Error loading architecture image:", error);
        }
    };
    return (
        <div className="px-4 py-2 border-t border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
                {" "}
                开始对话以生成或修改图表，尝试这些示例：
            </p>
            <p className="text-sm text-gray-500 mb-2"></p>
            <div className="flex flex-wrap gap-5">
                <button
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                    onClick={() =>
                        setInput("帮我设计微服务的架构图")
                    }
                >
                    帮我设计微服务的架构图
                </button>
                <button
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                    onClick={() => setInput("帮我设计一个订单流程")}
                >
                    帮我设计一个订单流程
                </button>
                <button
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                    onClick={() => setInput("帮我画一只卡通机器猫")}
                >
                    帮我画一只卡通机器猫
                </button>
                <button
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                    onClick={handleReplicateArchitecture}
                >
                    以AWS风格创建此图
                </button>
                <button
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded"
                    onClick={handleReplicateFlowchart}
                >
                    复制此流程图
                </button>
            </div>
        </div>
    );
}
