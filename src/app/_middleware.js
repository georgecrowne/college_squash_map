export default function middleware(request) {
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
    if (isMobile) {
      return new Response("Mobile access restricted", { status: 403 });
    }
  
    return NextResponse.next();
  }