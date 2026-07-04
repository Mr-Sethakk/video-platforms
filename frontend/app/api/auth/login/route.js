export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const mockUsers = [
      { id: 1, username: "admin", password: "admin123", role: "ADMIN" },
      { id: 2, username: "user", password: "user123", role: "USER" },
    ];

    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return Response.json(
        { success: false, code: 401, message: "用户名或密码错误", data: null },
        { status: 401 }
      );
    }

    const tokenPayload = { userId: user.id, username: user.username, role: user.role };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

    return Response.json({
      success: true,
      code: 200,
      message: "操作成功",
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      },
    });
  } catch {
    return Response.json(
      { success: false, code: 400, message: "请求参数错误", data: null },
      { status: 400 }
    );
  }
}
