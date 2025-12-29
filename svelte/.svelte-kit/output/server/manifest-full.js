export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.C8NCFqqN.js",app:"_app/immutable/entry/app.CZZWynTJ.js",imports:["_app/immutable/entry/start.C8NCFqqN.js","_app/immutable/chunks/BUw4uo_e.js","_app/immutable/chunks/BP1zTMgj.js","_app/immutable/chunks/DnTtdWNR.js","_app/immutable/entry/app.CZZWynTJ.js","_app/immutable/chunks/BP1zTMgj.js","_app/immutable/chunks/yP3LQI1T.js","_app/immutable/chunks/r-O8IUaT.js","_app/immutable/chunks/C-PSXTHy.js","_app/immutable/chunks/DnTtdWNR.js","_app/immutable/chunks/YNtNQseC.js","_app/immutable/chunks/BzDyJ6E2.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
