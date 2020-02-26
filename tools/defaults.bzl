load("@npm_bazel_typescript//:index.bzl", _ts_library = "ts_library")

def ts_library(tsconfig = "//:tsconfig.json", deps = [], **kwargs):
    deps = ["@npm//tslib", "@npm//@types/node"] + deps

    _ts_library(
        tsconfig = tsconfig,
        deps = deps,
        **kwargs
    )

def nest_library(deps = [], **kwargs):
    deps = ["@npm//@nestjs/common"] + deps

    ts_library(
        deps = deps,
        **kwargs
    )
