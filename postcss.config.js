module.exports = {
    plugins: [
        require('postcss-pxtorem')({
            rootValue: 37.5,
            propList: ['*'],
            selectorBlackList: ['.norem', '.extension-container'],
            minPixelValue: 2
        }),
        require('autoprefixer')({
            overrideBrowserslist: [
                'last 2 versions',
                '> 1%',
                'iOS 7',
                'last 3 iOS versions'
            ]
        })
    ]
}