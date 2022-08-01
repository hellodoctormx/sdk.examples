@file:OptIn(ExperimentalMaterialApi::class)

package com.hellodoctormx.examples.foodpass

import android.content.Context
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hellodoctormx.sdk.api.ConsultationsAPI
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.*

class AppViewModel : ViewModel() {
    var activeScreen by mutableStateOf("home")
    var activeSpecialty: String? by mutableStateOf(null)
    var selectedDate: LocalDate by mutableStateOf(LocalDate.now())
    var selectedTime: ZonedDateTime? by mutableStateOf(null)
    var isScheduling by mutableStateOf(false)
    var shouldShowSuccessDialog by mutableStateOf(false)

    fun doScheduleConsultation(context: Context) {
        isScheduling = true

        val specialty = activeSpecialty ?: return
        val requestedStart = selectedTime ?: return
        val consultationsAPI = ConsultationsAPI(context)

        viewModelScope.launch {
            consultationsAPI.requestCallCenterConsultation(
                specialty,
                requestedStart,
                "Any reason, whatever"
            )

            isScheduling = false

            shouldShowSuccessDialog = true
            delay(4000)
            shouldShowSuccessDialog = false
            activeScreen = "home"
            activeSpecialty = null
            selectedTime = null
        }
    }
}

@Composable
fun RappiApp(viewModel: AppViewModel) {
    if (viewModel.activeScreen === "home") AppHomeScreen(viewModel = viewModel)
    else if (viewModel.activeScreen === "telemedicine") TelemedicineHomeScreen(viewModel = viewModel)
}

@Composable
fun TelemedicineHomeScreen(viewModel: AppViewModel) {
    Surface(elevation = 0.dp) {
        Column(modifier = Modifier.fillMaxSize()) {
            Box(contentAlignment = Alignment.BottomCenter) {
                Image(
                    painter = painterResource(id = R.drawable.img_telemedicine_header),
                    contentDescription = null,
                    contentScale = ContentScale.FillWidth,
                    modifier = Modifier.fillMaxWidth()
                )
                Image(
                    painter = painterResource(id = R.drawable.hellodoctor_logo),
                    contentDescription = null,
                    contentScale = ContentScale.FillWidth,
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .padding(12.dp),
                    alignment = Alignment.Center
                )
            }
            Column(verticalArrangement = Arrangement.Top) {
                Text("Specialties", fontWeight = FontWeight.Bold)
                LazyRow {
                    item {
                        SpecialtyOption(
                            viewModel = viewModel,
                            imageResource = R.drawable.img_specialties_general_medicine,
                            specialty = "Médico General"
                        )
                    }
                    item {
                        SpecialtyOption(
                            viewModel = viewModel,
                            imageResource = R.drawable.img_specialties_psychology,
                            specialty = "Psicología"
                        )
                    }
                    item {
                        SpecialtyOption(
                            viewModel = viewModel,
                            imageResource = R.drawable.img_specialties_physical_therapy,
                            specialty = "Fisioterapeuta"
                        )
                    }
                }
            }
            Image(
                painter = painterResource(id = R.drawable.img_telemedicine_footer),
                contentDescription = null,
                contentScale = ContentScale.FillWidth,
                modifier = Modifier.fillMaxWidth()
            )
        }
        if (viewModel.activeSpecialty != null) {
            ActiveSpecialty(viewModel = viewModel)
        }
    }
}

@Composable
fun SpecialtyOption(viewModel: AppViewModel, imageResource: Int, specialty: String) {
    fun selectOption() {
        viewModel.activeSpecialty = specialty
    }

    Box(
        modifier = Modifier
            .height(128.dp)
            .width(128.dp)
            .padding(6.dp)
            .clip(RoundedCornerShape(3.dp))
    ) {
        Image(
            painter = painterResource(id = R.drawable.img_specialty_background),
            contentDescription = null,
            modifier = Modifier.fillMaxSize()
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(9.dp)
                .clickable { selectOption() },
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(id = imageResource),
                contentDescription = null,
                modifier = Modifier.size(48.dp)
            )
            Text(
                specialty.uppercase(Locale.ROOT),
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        }
        Column(verticalArrangement = Arrangement.Center, modifier = Modifier.fillMaxHeight()) {
            Box(modifier = Modifier.background(Color(0xFFee9036))) {
                Text(
                    "$100",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(3.dp)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun ActiveSpecialty(viewModel: AppViewModel) {
    val startTime = ZonedDateTime.now().plusDays(1).truncatedTo(ChronoUnit.DAYS)
    val context = LocalContext.current
    val specialtyModalState = rememberModalBottomSheetState(ModalBottomSheetValue.Hidden)
    val scope = rememberCoroutineScope()

    LaunchedEffect(key1 = viewModel.activeSpecialty, block = {
        if (viewModel.activeSpecialty == null) specialtyModalState.hide()
        else specialtyModalState.show()
    })

    ModalBottomSheetLayout(
        sheetState = specialtyModalState,
        sheetContent = {
            Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Row(
                    modifier = Modifier
                        .padding(12.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Schedule your consultation",
                        color = Color.Black,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        modifier = Modifier.drawBehind {
                            val strokeWidth = 1f
                            val y = size.height - strokeWidth / 2

                            drawLine(
                                Color.LightGray,
                                Offset(0f, y),
                                Offset(size.width, y),
                                strokeWidth
                            )
                        })
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .size(24.dp)
                            .background(Color.Gray.copy(alpha = 0.6f))
                            .clickable { viewModel.activeSpecialty = null },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("X", fontWeight = FontWeight.Bold)
                    }
                }
                LazyRow {
                    item {
                        SelectableDate(viewModel = viewModel, date = LocalDate.now())
                        SelectableDate(viewModel = viewModel, date = LocalDate.now().plusDays(1))
                        SelectableDate(viewModel = viewModel, date = LocalDate.now().plusDays(2))
                        SelectableDate(viewModel = viewModel, date = LocalDate.now().plusDays(3))
                        SelectableDate(viewModel = viewModel, date = LocalDate.now().plusDays(4))
                    }
                }
                LazyColumn(modifier = Modifier.fillMaxWidth()) {
                    item {
                        SelectableStartTime(viewModel = viewModel, startTime = startTime)
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(30)
                        )
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(60)
                        )
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(90)
                        )
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(120)
                        )
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(150)
                        )
                    }
                    item {
                        SelectableStartTime(
                            viewModel = viewModel,
                            startTime = startTime.plusMinutes(180)
                        )
                    }
                }
                if (viewModel.selectedTime != null || true)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .clip(RoundedCornerShape(18.dp))
                            .background(Color.Green.copy(alpha = 0.5f))
                            .clickable { viewModel.doScheduleConsultation(context) }) {
                        Text(
                            "Programar",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .padding(12.dp)
                                .fillMaxWidth()
                        )
                        if (viewModel.isScheduling) LinearProgressIndicator()
                    }
            }
            if (viewModel.shouldShowSuccessDialog) SchedulingSuccessAlert(viewModel = viewModel)
        }
    ) {

    }
}

@Composable
fun SchedulingSuccessAlert(viewModel: AppViewModel) {
    AlertDialog(
        onDismissRequest = {
            viewModel.shouldShowSuccessDialog = false
        },
        title = {
            Text(text = "Consulta programada!")
        },
        text = {
            Text("Please check your email for more details.")
        },
        confirmButton = {
            Button(
                onClick = {
                    viewModel.shouldShowSuccessDialog = false
                }) {
                Text("Cerrar")
            }
        }
    )
}

@Composable
fun SelectableStartTime(viewModel: AppViewModel, startTime: ZonedDateTime) {
    fun selectTime() {
        viewModel.selectedTime = startTime
    }

    val endTime = startTime.plus(30, ChronoUnit.MINUTES)

    Row(verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .padding(24.dp)
            .drawBehind {
                val strokeWidth = 1f
                val y = size.height - strokeWidth / 2

                drawLine(
                    Color.LightGray,
                    Offset(0f, y),
                    Offset(size.width, y),
                    strokeWidth
                )
            }
            .clickable { selectTime() }) {
        Box(
            modifier = Modifier
                .border(2.dp, color = Color.Black, shape = CircleShape)
                .padding(6.dp)
        )
        Text(
            startTime.format(DateTimeFormatter.ofPattern("H:mm")),
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 12.dp)
        )
        Text("-", modifier = Modifier.padding(3.dp))
        Text(endTime.format(DateTimeFormatter.ofPattern("H:mm")), fontWeight = FontWeight.Bold)
    }
}

@Composable
fun SelectableDate(viewModel: AppViewModel, date: LocalDate) {
    val isSelected = viewModel.selectedDate == date

    Box(modifier = Modifier.padding(12.dp)) {
        Column(
            modifier = Modifier
                .width(72.dp)
                .border(
                    width = 0.5.dp,
                    color = if (isSelected) Color.Green.copy(alpha = 0.8f) else Color.Gray.copy(
                        alpha = 0.5f
                    ),
                    shape = RoundedCornerShape(18.dp)
                )
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                date.format(DateTimeFormatter.ofPattern("EE")).toString(),
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Bold
            )
            Text(
                date.format(DateTimeFormatter.ofPattern("MMM d")).toString(),
                textAlign = TextAlign.Center,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun AppHomeScreen(viewModel: AppViewModel) {
    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Image(
            painter = painterResource(id = R.drawable.img_rappi_demo_header),
            contentDescription = null,
            contentScale = ContentScale.FillWidth,
            modifier = Modifier.fillMaxWidth()
        )
        Surface(
            elevation = 5.dp,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth(0.9f)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.padding(15.dp)
            ) {
                Text(text = "What do you want today?")
                Icon(
                    imageVector = Icons.Rounded.Search,
                    contentDescription = "search-icon",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        MarketplacesList(viewModel)
    }
}

@Composable
fun MarketplacesList(viewModel: AppViewModel) {
    LazyRow(modifier = Modifier.padding(12.dp)) {
        item {
            Column {
                MarketplaceIcon(
                    iconResource = R.drawable.ic_restaurant,
                    name = "Restaurant",
                    onClick = {})
                MarketplaceIcon(
                    iconResource = R.drawable.ic_pharmacy,
                    name = "Pharmacy",
                    onClick = {})
            }
        }
        item {
            Column {
                MarketplaceIcon(iconResource = R.drawable.ic_market, name = "Market", onClick = {})
                MarketplaceIcon(iconResource = R.drawable.ic_turbo, name = "Turbo", onClick = {})
            }
        }
        item {
            Column {
                MarketplaceIcon(
                    iconResource = R.drawable.ic_express,
                    name = "Express",
                    onClick = {})
                MarketplaceIcon(
                    iconResource = R.drawable.ic_telemedicine,
                    name = "Telemedicine",
                    onClick = {
                        viewModel.activeScreen = "telemedicine"
                    })
            }
        }
        item {
            Column {
                MarketplaceIcon(iconResource = R.drawable.ic_stores, name = "Stores", onClick = {})
                MarketplaceIcon(iconResource = R.drawable.ic_liquor, name = "Liquor", onClick = {})
            }
        }
        item {
            Column {
                MarketplaceIcon(iconResource = R.drawable.ic_pet, name = "Pet", onClick = {})
                MarketplaceIcon(
                    iconResource = R.drawable.ic_more_services,
                    name = "More services",
                    onClick = {})
            }
        }
    }
}

@Composable
fun MarketplaceIcon(iconResource: Int, name: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(112.dp)
            .padding(12.dp)
            .clickable { onClick() }
    ) {
        Image(
            painter = painterResource(id = iconResource),
            contentDescription = null,
            contentScale = ContentScale.FillWidth,
            modifier = Modifier.fillMaxWidth()
        )
        Text(text = name)
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    RappiApp(AppViewModel())
}
