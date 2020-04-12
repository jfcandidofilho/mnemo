<!DOCTYPE html>
<html>

    <head>
    
        <title>MNEMO</title>
    
        <link rel="stylesheet" type="text/css" href="./layout.css" />
    
        <script type="text/javascript" src="./draw.js"></script>
    
    </head>
    
    <body>
    
        <div id="menu">
            
            <h2>SCORE</h2>
            <div id="score">
            
                <div class="score total">total<br /><span id="total"></span></div>
                <div class="score current">current<br /><span id="current"></span></div>

                <div class="clear"></div>
            
            </div>

            <div onclick="javascript: start();" class="button">Restart Game</div>

        </div>

        <div id="nav">
        
            <div id="mnemo" class="table">
            
                <div id="row-0" class="row">

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="clear"></div>

                </div>

                <div id="row-1" class="row">

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="clear"></div>

                </div>

                <div id="row-2" class="row">

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="clear"></div>

                </div>

                <div id="row-3" class="row">

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="cell"></div>

                    <div class="clear"></div>

                </div>
            
            </div>

        </div>

        <div class="clear"></div>

        <div id="sounds"></div>
    
    </body>

</html>
