(function( a ) {
    a.fn.validate.methods = {trim:function( c, b ) {
        if ( typeof c == "string" ) {
            c = c.replace( /^[\s\r\n\t]+/, "" ).replace( /[\s\r\n\t]+$/, "" );
            a( b ).val( c )
        }
        return true
    },mask:function( d, b, c ) {
        if ( typeof c != "string" && !(c instanceof RegExp) ) {
            return true
        }
        if ( typeof c == "string" ) {
            c = new RegExp( c )
        }
        return d.match( c )
    },totalPartsRange:function( e, d, h ) {
        if ( !(h instanceof Array) ) {
            h = [h]
        }
        var c = parseInt( h[0] );
        var b = parseInt( h[1] );
        var g = (typeof h[2] == "string") ? h[2] : ",";
        var f = Evernote.Utils.separateString( e, g );
        return(f.length >= c && f.length <= b)
    },partLengthRange:function( f, e, j ) {
        if ( !(j instanceof Array) ) {
            j = [j]
        }
        var d = parseInt( j[0] );
        var b = parseInt( j[1] );
        var h = (typeof j[2] == "string") ? j[2] : ",";
        var g = Evernote.Utils.separateString( f, h );
        if ( g ) {
            for ( var c = 0; c < g.length; c++ ) {
                if ( g[c].length < d || g[c].length > b ) {
                    return false
                }
            }
        }
        return true
    },partMask:function( e, d, h ) {
        if ( !(h instanceof Array) ) {
            h = [h]
        }
        var b = h[0];
        var g = (typeof h[1] == "string") ? h[1] : ",";
        var f = Evernote.Utils.separateString( e, g );
        if ( f ) {
            for ( var c = 0; c < f.length; c++ ) {
                if ( !f[c].match( b ) ) {
                    return false
                }
            }
        }
        return true
    },replace:function( e, b, f ) {
        var d = (f[0] instanceof RegExp) ? f[0] : new RegExp( f[0] );
        var c = f[1];
        if ( typeof e == "string" ) {
            a( b ).val( e.replace( d, c ) )
        }
        return true
    },toLowerCase:function( c, b ) {
        if ( typeof c == "string" ) {
            a( b ).val( c.toLowerCase() )
        }
        return true
    },toUpperCase:function( c, b ) {
        if ( typeof c == "string" ) {
            a( b ).val( c.toUpperCase() )
        }
        return true
    },callback:function( c, b, d ) {
        if ( typeof d == "function" ) {
            return(d( c, b )) ? true : false
        }
        return false
    }}
})( jQuery );