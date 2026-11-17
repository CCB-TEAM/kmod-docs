
# require

```lua
local util = require("util")        -- 读取 <模组目录>/util.lua
local x = require("lib.helpers")    -- 读取 <模组目录>/lib/helpers.lua
```

- 只能读本模组目录里的文件，`.` 当作目录分隔符。
- 结果会缓存：同一个模组里第二次 `require` 同名模块返回缓存的值。
- 模块在该模组自己的环境里运行，能用 `Log`、`Settings` 等。
