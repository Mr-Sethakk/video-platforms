const registeredUsernames = ["admin", "user"];

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, code: 400, message: "用户名和密码不能为空", data: null },
        { status: 400 }
      );
    }

    if (registeredUsernames.includes(username)) {
      return Response.json(
        { success: false, code: 400, message: "用户名已存在", data: null },
        { status: 400 }
      );
    }

    registeredUsernames.push(username);

    return Response.json({
      success: true,
      code: 200,
      message: "操作成功",
      data: {
        user: {
          id: Date.now(),
          username,
          email,
          role: "USER",
        },
      },
    });
  } catch {
    return Response.json(
      { success: false, code: 400, message: "请求参数错误", data: null },
      { status: 400 }
    );
  }
}
